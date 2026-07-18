"""Master multi-symbol scanning loop."""

from __future__ import annotations

import logging
import time

from trading_bot.base44_store import Base44Store
from trading_bot.brokers import BrokerAdapter, create_broker
from trading_bot.config import BotConfig
from trading_bot.execution import OrderExecutor
from trading_bot.models import Signal, SignalState
from trading_bot.notifications import Notifier
from trading_bot.risk import RiskManager
from trading_bot.strategy import StrategyEngine
from trading_bot.symbol_state import SymbolContext

logger = logging.getLogger(__name__)


class MultiSymbolScanner:
    """
    Decoupled master scanner — evaluates every symbol on each poll cycle
    instead of relying on a single chart's OnTick().
    """

    def __init__(self, config: BotConfig) -> None:
        self.config = config
        self.broker: BrokerAdapter = create_broker(config)
        self.strategy = StrategyEngine(config)
        self.risk = RiskManager(config)
        self.store = Base44Store(config)
        self.notifier = Notifier(config)
        self.executor = OrderExecutor(self.broker, self.store, self.notifier)
        self.contexts: dict[str, SymbolContext] = {}

    def on_init(self) -> None:
        self.broker.start()
        self.contexts = self.broker.ensure_symbols(self.config.symbols)
        logger.info(
            "Bot started | symbols=%s poll=%ss mode=%s",
            ",".join(self.contexts.keys()),
            self.config.poll_seconds,
            self.config.mode,
        )

    def on_deinit(self) -> None:
        self.broker.stop()

    def scan_all_pairs(self) -> list[Signal]:
        """
        Core multi-symbol loop:
        1. Refresh market data for every symbol
        2. Evaluate strategy independently per symbol
        3. Collect signals, apply global risk/margin checks
        4. Execute approved signals concurrently
        """
        self.broker.refresh_market_data(self.contexts)
        account = self.broker.get_account()
        pending_signals: list[Signal] = []

        for symbol, ctx in self.contexts.items():
            ctx.state = SignalState.SCANNING
            quote = ctx.last_quote
            if quote is None:
                ctx.state = SignalState.IDLE
                continue

            if not self.risk.spread_ok(quote):
                ctx.state = SignalState.IDLE
                continue

            if not self.risk.symbol_can_trade(ctx):
                ctx.state = SignalState.IN_POSITION if ctx.open_positions else SignalState.IDLE
                continue

            lots = self.risk.calc_lot_size(account, _dummy_signal(symbol, quote), self.config.default_sl_pips)
            signal = self.strategy.evaluate(ctx, quote, lots)
            if signal:
                ctx.state = SignalState.SIGNAL_PENDING
                pending_signals.append(signal)
                logger.info(
                    "Signal %s | %s entry=%.5f sl=%.5f tp=%.5f lots=%.2f",
                    signal.side.value,
                    symbol,
                    signal.entry,
                    signal.sl,
                    signal.tp,
                    signal.lots,
                )
            else:
                ctx.state = SignalState.IDLE

        approved = self.risk.approve_signals(account, pending_signals, self.contexts)
        if not approved:
            return []

        simulated = not hasattr(self.broker, "_mt5") or self.broker.__class__.__name__ == "SimulationBroker"
        self.executor.execute_batch(approved, simulated=simulated)

        for sig in approved:
            ctx = self.contexts[sig.symbol]
            ctx.state = SignalState.IN_POSITION
            ctx.open_positions = self.broker.count_positions(sig.symbol)

        return approved

    def run_forever(self) -> None:
        self.on_init()
        cycles = 0
        try:
            while True:
                signals = self.scan_all_pairs()
                cycles += 1
                if self.config.test_cycles and cycles >= self.config.test_cycles:
                    logger.info("Completed %s test cycle(s). Exiting.", self.config.test_cycles)
                    break
                if not signals:
                    time.sleep(self.config.poll_seconds)
        finally:
            self.on_deinit()

    def run_once(self) -> list[Signal]:
        self.on_init()
        try:
            return self.scan_all_pairs()
        finally:
            self.on_deinit()


def _dummy_signal(symbol: str, quote) -> Signal:
    from trading_bot.models import Side

    return Signal(
        symbol=symbol,
        side=Side.BUY,
        entry=quote.ask,
        sl=quote.bid,
        tp=quote.ask,
        lots=0.01,
        htf_trend="",
        ltf_reason="",
        spread_points=quote.spread_points,
    )
