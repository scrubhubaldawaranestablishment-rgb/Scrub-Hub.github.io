"""Per-symbol state container for indicators, bars, and position tracking."""

from __future__ import annotations

from dataclasses import dataclass, field

from trading_bot.models import Bar, Quote, SignalState


@dataclass
class SymbolContext:
    """Independent state machine and data handles for one symbol."""

    symbol: str
    state: SignalState = SignalState.IDLE
    last_bar_time: int = 0
    open_positions: int = 0
    htf_bars: list[Bar] = field(default_factory=list)
    ltf_bars: list[Bar] = field(default_factory=list)
    last_quote: Quote | None = None
    # MT5 indicator handles (live mode only; set by broker adapter)
    ema_fast_handle: int | None = None
    ema_slow_handle: int | None = None
    rsi_handle: int | None = None
    selected: bool = False

    def update_positions(self, count: int) -> None:
        self.open_positions = count
        self.state = SignalState.IN_POSITION if count > 0 else SignalState.IDLE
