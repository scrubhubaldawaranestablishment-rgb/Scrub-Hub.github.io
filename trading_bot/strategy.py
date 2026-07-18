"""Confluence strategy: HTF trend alignment + LTF momentum crossover."""

from __future__ import annotations

import logging
from typing import Sequence

from trading_bot.config import BotConfig
from trading_bot.models import Bar, Quote, Side, Signal
from trading_bot.symbol_state import SymbolContext

logger = logging.getLogger(__name__)


def _ema(values: Sequence[float], period: int) -> float:
    if len(values) < period:
        return values[-1] if values else 0.0
    k = 2 / (period + 1)
    ema = sum(values[:period]) / period
    for price in values[period:]:
        ema = price * k + ema * (1 - k)
    return ema


def _rsi(closes: Sequence[float], period: int) -> float:
    if len(closes) < period + 1:
        return 50.0
    gains, losses = [], []
    for i in range(1, len(closes)):
        delta = closes[i] - closes[i - 1]
        gains.append(max(delta, 0))
        losses.append(max(-delta, 0))
    avg_gain = sum(gains[-period:]) / period
    avg_loss = sum(losses[-period:]) / period
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))


def _pip_size(symbol: str) -> float:
    return 0.01 if symbol.endswith("JPY") else 0.0001


class StrategyEngine:
    """Evaluates multi-timeframe confluence for each symbol."""

    def __init__(self, config: BotConfig) -> None:
        self.config = config

    def htf_trend(self, bars: list[Bar]) -> str:
        closes = [b.close for b in bars]
        if len(closes) < self.config.ema_slow:
            return "neutral"
        fast = _ema(closes, self.config.ema_fast)
        slow = _ema(closes, self.config.ema_slow)
        if fast > slow * 1.0001:
            return "bullish"
        if fast < slow * 0.9999:
            return "bearish"
        return "neutral"

    def evaluate(self, ctx: SymbolContext, quote: Quote, lots: float) -> Signal | None:
        if len(ctx.htf_bars) < self.config.ema_slow or len(ctx.ltf_bars) < self.config.rsi_period + 2:
            return None

        trend = self.htf_trend(ctx.htf_bars)
        if trend == "neutral":
            return None

        ltf_closes = [b.close for b in ctx.ltf_bars]
        rsi_now = _rsi(ltf_closes, self.config.rsi_period)
        rsi_prev = _rsi(ltf_closes[:-1], self.config.rsi_period)
        pip = _pip_size(ctx.symbol)

        side: Side | None = None
        reason = ""

        if trend == "bullish" and rsi_prev < self.config.rsi_oversold <= rsi_now:
            side = Side.BUY
            reason = f"RSI crossover above {self.config.rsi_oversold:.0f} ({rsi_prev:.1f}->{rsi_now:.1f})"
        elif trend == "bearish" and rsi_prev > self.config.rsi_overbought >= rsi_now:
            side = Side.SELL
            reason = f"RSI crossover below {self.config.rsi_overbought:.0f} ({rsi_prev:.1f}->{rsi_now:.1f})"

        if side is None:
            return None

        entry = quote.ask if side == Side.BUY else quote.bid
        sl_dist = self.config.default_sl_pips * pip
        tp_dist = self.config.default_tp_pips * pip

        if side == Side.BUY:
            sl = round(entry - sl_dist, 5 if pip < 0.001 else 3)
            tp = round(entry + tp_dist, 5 if pip < 0.001 else 3)
        else:
            sl = round(entry + sl_dist, 5 if pip < 0.001 else 3)
            tp = round(entry - tp_dist, 5 if pip < 0.001 else 3)

        logger.debug(
            "%s confluence OK | trend=%s rsi=%.1f side=%s",
            ctx.symbol,
            trend,
            rsi_now,
            side.value,
        )

        return Signal(
            symbol=ctx.symbol,
            side=side,
            entry=entry,
            sl=sl,
            tp=tp,
            lots=lots,
            htf_trend=trend,
            ltf_reason=reason,
            spread_points=quote.spread_points,
        )
