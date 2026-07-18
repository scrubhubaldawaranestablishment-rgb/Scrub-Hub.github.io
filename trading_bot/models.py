"""Shared domain models."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any


class Side(str, Enum):
    BUY = "BUY"
    SELL = "SELL"


class SignalState(str, Enum):
    IDLE = "idle"
    SCANNING = "scanning"
    SIGNAL_PENDING = "signal_pending"
    IN_POSITION = "in_position"
    COOLDOWN = "cooldown"


@dataclass
class Bar:
    time: int
    open: float
    high: float
    low: float
    close: float
    tick_volume: int = 0


@dataclass
class Quote:
    symbol: str
    bid: float
    ask: float
    spread_points: float
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class Signal:
    symbol: str
    side: Side
    entry: float
    sl: float
    tp: float
    lots: float
    htf_trend: str
    ltf_reason: str
    spread_points: float
    simulated: bool = False

    def to_alert_message(self) -> str:
        ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        emoji = "⚡️" if self.side == Side.BUY else "🔻"
        mode = " [SIM]" if self.simulated else ""
        return (
            f"{emoji} {self.side.value} Signal Triggered on {self.symbol}{mode}\n"
            f"Entry: {self.entry:.5f} | SL: {self.sl:.5f} | TP: {self.tp:.5f}\n"
            f"Lots: {self.lots:.2f} | Spread: {self.spread_points:.1f} pts\n"
            f"HTF: {self.htf_trend} | LTF: {self.ltf_reason}\n"
            f"Time: {ts}"
        )


@dataclass
class TradeRecord:
    id: str
    ticket: int
    symbol: str
    side: str
    lots: float
    entry: float
    sl: float
    tp: float
    timestamp: str
    retcode: int | None = None
    comment: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "ticket": self.ticket,
            "symbol": self.symbol,
            "side": self.side,
            "lots": self.lots,
            "entry": self.entry,
            "sl": self.sl,
            "tp": self.tp,
            "timestamp": self.timestamp,
            "retcode": self.retcode,
            "comment": self.comment,
        }


@dataclass
class ExecutionResult:
    success: bool
    ticket: int = 0
    retcode: int = 0
    comment: str = ""
    error: str = ""
