"""Order execution with MT5 retcode handling."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone

from trading_bot.base44_store import Base44Store
from trading_bot.brokers import BrokerAdapter
from trading_bot.models import ExecutionResult, Signal, TradeRecord
from trading_bot.notifications import Notifier

logger = logging.getLogger(__name__)

# Common MT5 trade return codes
RETCODE_DONE = 10009
RETCODE_REQUOTE = 10004
RETCODE_REJECT = 10006
RETCODE_INVALID_STOPS = 10016
RETCODE_TRADE_DISABLED = 10017
RETCODE_MARKET_CLOSED = 10018
RETCODE_NO_MONEY = 10019
RETCODE_PRICE_CHANGED = 10020
RETCODE_OFF_QUOTES = 10021


class OrderExecutor:
    def __init__(
        self,
        broker: BrokerAdapter,
        store: Base44Store,
        notifier: Notifier,
    ) -> None:
        self.broker = broker
        self.store = store
        self.notifier = notifier

    def execute_batch(self, signals: list[Signal], simulated: bool = False) -> list[TradeRecord]:
        records: list[TradeRecord] = []
        for signal in signals:
            signal.simulated = simulated
            self.notifier.notify_signal(signal)
            result = self._send_with_retry(signal)
            if not result.success:
                self.notifier.notify_error(signal.symbol, result.error, result.retcode)
                logger.error(
                    "%s execution failed | retcode=%s %s",
                    signal.symbol,
                    result.retcode,
                    result.error,
                )
                continue

            trade = TradeRecord(
                id=str(uuid.uuid4()),
                ticket=result.ticket,
                symbol=signal.symbol,
                side=signal.side.value,
                lots=signal.lots,
                entry=signal.entry,
                sl=signal.sl,
                tp=signal.tp,
                timestamp=datetime.now(timezone.utc).isoformat(),
                retcode=result.retcode,
                comment=result.comment,
            )
            self.store.save_trade(trade)
            self.notifier.notify_trade(trade)
            records.append(trade)
            logger.info(
                "Trade executed | %s ticket=%s %s %.2f lots @ %.5f",
                signal.symbol,
                result.ticket,
                signal.side.value,
                signal.lots,
                signal.entry,
            )
        return records

    def _send_with_retry(self, signal: Signal, max_retries: int = 2) -> ExecutionResult:
        result = self.broker.send_order(signal)
        if result.success:
            return result

        # Retry on transient errors (requote, price changed, off quotes)
        transient = {RETCODE_REQUOTE, RETCODE_PRICE_CHANGED, RETCODE_OFF_QUOTES}
        attempts = 0
        while result.retcode in transient and attempts < max_retries:
            attempts += 1
            logger.warning(
                "%s transient error %s — retry %d/%d",
                signal.symbol,
                result.retcode,
                attempts,
                max_retries,
            )
            result = self.broker.send_order(signal)

        return result
