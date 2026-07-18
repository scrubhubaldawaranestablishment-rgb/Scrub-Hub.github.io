"""Per-symbol and global risk management."""

from __future__ import annotations

import logging
from typing import Protocol

from trading_bot.config import BotConfig
from trading_bot.models import Quote, Signal
from trading_bot.symbol_state import SymbolContext

logger = logging.getLogger(__name__)


class AccountInfo(Protocol):
  balance: float
  equity: float
  free_margin: float
  margin_level: float


class RiskManager:
    """Independent position limits per symbol + global margin guardrails."""

    def __init__(self, config: BotConfig) -> None:
        self.config = config

    def spread_ok(self, quote: Quote) -> bool:
        if quote.spread_points > self.config.max_spread_points:
            logger.info(
                "%s spread %.1f > max %d — skipped",
                quote.symbol,
                quote.spread_points,
                self.config.max_spread_points,
            )
            return False
        return True

    def symbol_can_trade(self, ctx: SymbolContext) -> bool:
        if ctx.open_positions >= self.config.max_open_trades_per_symbol:
            logger.debug(
                "%s max open trades reached (%d/%d)",
                ctx.symbol,
                ctx.open_positions,
                self.config.max_open_trades_per_symbol,
            )
            return False
        return True

    def calc_lot_size(self, account: AccountInfo, signal: Signal, sl_pips: float) -> float:
        risk_amount = account.balance * (self.config.risk_percent / 100.0)
        pip_value_per_lot = 10.0  # simplified USD account assumption
        if sl_pips <= 0:
            return 0.01
        lots = risk_amount / (sl_pips * pip_value_per_lot)
        return max(0.01, round(min(lots, 5.0), 2))

    def global_margin_ok(self, account: AccountInfo, pending_count: int) -> bool:
        if account.balance <= 0:
            return False
        free_pct = (account.free_margin / account.balance) * 100
        if free_pct < self.config.min_free_margin_pct:
            logger.warning(
                "Free margin %.1f%% below minimum %.1f%% — blocking %d concurrent orders",
                free_pct,
                self.config.min_free_margin_pct,
                pending_count,
            )
            return False
        if pending_count > self.config.max_concurrent_signals:
            logger.warning(
                "Concurrent signals %d exceed max %d",
                pending_count,
                self.config.max_concurrent_signals,
            )
            return False
        return True

    def approve_signals(
        self,
        account: AccountInfo,
        signals: list[Signal],
        contexts: dict[str, SymbolContext],
    ) -> list[Signal]:
        approved: list[Signal] = []
        for signal in signals:
            ctx = contexts[signal.symbol]
            quote = ctx.last_quote
            if quote is None:
                continue
            if not self.spread_ok(quote):
                continue
            if not self.symbol_can_trade(ctx):
                continue
            approved.append(signal)

        if not approved:
            return []

        if not self.global_margin_ok(account, len(approved)):
            # Prioritize symbols with fewer open positions
            approved.sort(key=lambda s: contexts[s.symbol].open_positions)
            approved = approved[: self.config.max_concurrent_signals]

        return approved
