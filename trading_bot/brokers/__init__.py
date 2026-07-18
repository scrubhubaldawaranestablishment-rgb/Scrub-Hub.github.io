"""Broker adapters: simulation (non-Windows) and MetaTrader5 (Windows)."""

from __future__ import annotations

import logging
import platform
import random
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

from trading_bot.config import BotConfig
from trading_bot.models import Bar, ExecutionResult, Quote, Side, Signal
from trading_bot.symbol_state import SymbolContext

logger = logging.getLogger(__name__)

TIMEFRAME_MAP = {
    "M1": 1,
    "M5": 5,
    "M15": 15,
    "M30": 30,
    "H1": 60,
    "H4": 240,
    "D1": 1440,
}


@dataclass
class SimAccount:
    balance: float = 10_000.0
    equity: float = 10_000.0
    free_margin: float = 10_000.0
    margin_level: float = 0.0


class BrokerAdapter(ABC):
    @abstractmethod
    def start(self) -> None: ...

    @abstractmethod
    def stop(self) -> None: ...

    @abstractmethod
    def ensure_symbols(self, symbols: list[str]) -> dict[str, SymbolContext]: ...

    @abstractmethod
    def refresh_market_data(self, contexts: dict[str, SymbolContext]) -> None: ...

    @abstractmethod
    def count_positions(self, symbol: str) -> int: ...

    @abstractmethod
    def get_account(self) -> Any: ...

    @abstractmethod
    def send_order(self, signal: Signal) -> ExecutionResult: ...


class SimulationBroker(BrokerAdapter):
    """Multi-symbol simulation broker for development and CI."""

    BASE_PRICES = {
        "EURUSD": 1.08500,
        "GBPUSD": 1.26500,
        "USDJPY": 157.500,
        "AUDUSD": 0.65200,
    }

    def __init__(self, config: BotConfig) -> None:
        self.config = config
        self.account = SimAccount()
        self._ticket = 100_000
        self._positions: dict[str, int] = {}
        self._cycle = 0

    def start(self) -> None:
        logger.info(
            "Simulation broker ready | balance=%.2f USD | symbols=%s",
            self.account.balance,
            ",".join(self.config.symbols),
        )

    def stop(self) -> None:
        logger.info("Simulation broker stopped.")

    def ensure_symbols(self, symbols: list[str]) -> dict[str, SymbolContext]:
        contexts: dict[str, SymbolContext] = {}
        for symbol in symbols:
            contexts[symbol] = SymbolContext(symbol=symbol, selected=True)
            self._positions.setdefault(symbol, 0)
            logger.info("SymbolSelect OK (sim): %s", symbol)
        return contexts

    def _generate_bars(self, symbol: str, count: int, base: float) -> list[Bar]:
        bars: list[Bar] = []
        price = base
        now = int(time.time())
        for i in range(count):
            drift = random.uniform(-0.0003, 0.0003)
            if self._cycle >= 3 and symbol == "EURUSD":
                drift = abs(drift) + 0.0005  # bullish breakout injection
            open_p = price
            close_p = price + drift
            high_p = max(open_p, close_p) + random.uniform(0, 0.0002)
            low_p = min(open_p, close_p) - random.uniform(0, 0.0002)
            bars.append(
                Bar(
                    time=now - (count - i) * 300,
                    open=round(open_p, 5),
                    high=round(high_p, 5),
                    low=round(low_p, 5),
                    close=round(close_p, 5),
                )
            )
            price = close_p
        return bars

    def refresh_market_data(self, contexts: dict[str, SymbolContext]) -> None:
        self._cycle += 1
        for symbol, ctx in contexts.items():
            base = self.BASE_PRICES.get(symbol, 1.0)
            ctx.htf_bars = self._generate_bars(symbol, 120, base)
            ctx.ltf_bars = self._generate_bars(symbol, 60, base)
            last = ctx.ltf_bars[-1]
            spread = 1.0 if symbol.endswith("JPY") else 0.00010
            bid = last.close
            ask = bid + spread
            ctx.last_quote = Quote(
                symbol=symbol,
                bid=round(bid, 5 if not symbol.endswith("JPY") else 3),
                ask=round(ask, 5 if not symbol.endswith("JPY") else 3),
                spread_points=10.0,
            )
            ctx.open_positions = self._positions.get(symbol, 0)

    def count_positions(self, symbol: str) -> int:
        return self._positions.get(symbol, 0)

    def get_account(self) -> SimAccount:
        return self.account

    def send_order(self, signal: Signal) -> ExecutionResult:
        self._ticket += 1
        self._positions[signal.symbol] = self._positions.get(signal.symbol, 0) + 1
        logger.info(
            "Simulated order | ticket=%s %s %.2f lots @ %.5f [%s]",
            self._ticket,
            signal.side.value,
            signal.lots,
            signal.entry,
            signal.symbol,
        )
        return ExecutionResult(success=True, ticket=self._ticket, retcode=10009, comment="simulated")


class MT5Broker(BrokerAdapter):
    """Live MetaTrader5 broker adapter (Windows only)."""

    def __init__(self, config: BotConfig) -> None:
        self.config = config
        self._mt5: Any = None

    def start(self) -> None:
        import MetaTrader5 as mt5

        self._mt5 = mt5
        if not mt5.initialize():
            raise RuntimeError(f"MT5 initialize failed: {mt5.last_error()}")
        info = mt5.account_info()
        if info is None:
            raise RuntimeError("MT5 account_info() returned None")
        logger.info(
            "MT5 connected | account=%s balance=%.2f",
            info.login,
            info.balance,
        )

    def stop(self) -> None:
        if self._mt5:
            self._mt5.shutdown()
            logger.info("MT5 disconnected.")

    def ensure_symbols(self, symbols: list[str]) -> dict[str, SymbolContext]:
        mt5 = self._mt5
        contexts: dict[str, SymbolContext] = {}
        for symbol in symbols:
            if not mt5.symbol_select(symbol, True):
                logger.error("SymbolSelect failed for %s: %s", symbol, mt5.last_error())
                continue
            ctx = SymbolContext(symbol=symbol, selected=True)
            contexts[symbol] = ctx
            logger.info("SymbolSelect OK: %s", symbol)
        return contexts

    def _tf(self, name: str) -> int:
        mt5 = self._mt5
        mapping = {
            "M1": mt5.TIMEFRAME_M1,
            "M5": mt5.TIMEFRAME_M5,
            "M15": mt5.TIMEFRAME_M15,
            "M30": mt5.TIMEFRAME_M30,
            "H1": mt5.TIMEFRAME_H1,
            "H4": mt5.TIMEFRAME_H4,
            "D1": mt5.TIMEFRAME_D1,
        }
        return mapping.get(name, mt5.TIMEFRAME_M5)

    def refresh_market_data(self, contexts: dict[str, SymbolContext]) -> None:
        mt5 = self._mt5
        for symbol, ctx in contexts.items():
            htf_rates = mt5.copy_rates_from_pos(symbol, self._tf(self.config.htf), 0, self.config.bars_lookback)
            ltf_rates = mt5.copy_rates_from_pos(symbol, self._tf(self.config.ltf), 0, self.config.bars_lookback)
            if htf_rates is None or ltf_rates is None:
                logger.warning("copy_rates_from_pos failed for %s: %s", symbol, mt5.last_error())
                continue
            ctx.htf_bars = [
                Bar(time=int(r["time"]), open=r["open"], high=r["high"], low=r["low"], close=r["close"])
                for r in htf_rates
            ]
            ctx.ltf_bars = [
                Bar(time=int(r["time"]), open=r["open"], high=r["high"], low=r["low"], close=r["close"])
                for r in ltf_rates
            ]
            tick = mt5.symbol_info_tick(symbol)
            info = mt5.symbol_info(symbol)
            if tick and info:
                spread_pts = (tick.ask - tick.bid) / info.point if info.point else 0
                ctx.last_quote = Quote(
                    symbol=symbol,
                    bid=tick.bid,
                    ask=tick.ask,
                    spread_points=spread_pts,
                    timestamp=datetime.fromtimestamp(tick.time, tz=timezone.utc),
                )
            ctx.open_positions = self.count_positions(symbol)

    def count_positions(self, symbol: str) -> int:
        mt5 = self._mt5
        positions = mt5.positions_get(symbol=symbol)
        if positions is None:
            return 0
        return sum(1 for p in positions if p.magic == self.config.magic_number)

    def get_account(self) -> Any:
        return self._mt5.account_info()

    def send_order(self, signal: Signal) -> ExecutionResult:
        mt5 = self._mt5
        info = mt5.symbol_info(signal.symbol)
        if info is None:
            return ExecutionResult(success=False, error=f"symbol_info failed: {mt5.last_error()}")

        order_type = mt5.ORDER_TYPE_BUY if signal.side == Side.BUY else mt5.ORDER_TYPE_SELL
        price = signal.entry
        request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": signal.symbol,
            "volume": signal.lots,
            "type": order_type,
            "price": price,
            "sl": signal.sl,
            "tp": signal.tp,
            "deviation": 20,
            "magic": self.config.magic_number,
            "comment": f"msbot_{signal.symbol}",
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": mt5.ORDER_FILLING_IOC,
        }
        result = mt5.order_send(request)
        if result is None:
            return ExecutionResult(success=False, error=f"order_send returned None: {mt5.last_error()}")

        if result.retcode != mt5.TRADE_RETCODE_DONE:
            # 4756 = TRADE_RETCODE_INVALID_STOPS / common send failure
            return ExecutionResult(
                success=False,
                retcode=result.retcode,
                comment=result.comment,
                error=f"order_send failed retcode={result.retcode} comment={result.comment}",
            )

        return ExecutionResult(
            success=True,
            ticket=result.order,
            retcode=result.retcode,
            comment=result.comment,
        )


def create_broker(config: BotConfig) -> BrokerAdapter:
    mode = config.mode.lower()
    if mode == "auto":
        mode = "live" if platform.system() == "Windows" else "simulation"
        if mode == "simulation":
            logger.info("Auto mode: non-Windows platform -> simulation")

    if mode == "live":
        return MT5Broker(config)
    return SimulationBroker(config)
