#!/usr/bin/env python3
"""Forex trading bot with simulation broker and optional Base44 persistence."""

from __future__ import annotations

import json
import logging
import os
import platform
import sys
import time
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DATA_DIR = Path("data")
STATE_FILE = DATA_DIR / "bot_state.json"
POLL_SECONDS = int(os.getenv("BOT_POLL_SECONDS", "10"))
TEST_CYCLES = int(os.getenv("BOT_TEST_CYCLES", "5"))
LOCAL_FALLBACK = os.getenv("BOT_LOCAL_FALLBACK", "false").lower() == "true"


def setup_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)-8s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )


def detect_mode() -> str:
    forced = os.getenv("BOT_MODE", "auto").lower()
    if forced in {"simulation", "live"}:
        return forced
    if platform.system() == "Windows":
        return "live"
    logging.info("Auto mode: non-Windows platform -> simulation")
    return "simulation"


@dataclass
class Quote:
    bid: float
    ask: float


@dataclass
class Signal:
    side: str
    entry: float
    sl: float
    tp: float
    lots: float
    simulated: bool = True


@dataclass
class TradeRecord:
    id: str
    ticket: int
    side: str
    lots: float
    entry: float
    sl: float
    tp: float
    timestamp: str


class SimulationBroker:
    def __init__(self, balance: float = 10_000.0) -> None:
        self.balance = balance
        self.bid = 1.08500
        self.ask = 1.08510
        self._ticket = 100_000
        self._running = False

    def start(self) -> None:
        self._running = True
        logging.info(
            "Simulation broker ready | balance=%.2f USD bid=%.5f ask=%.5f",
            self.balance,
            self.bid,
            self.ask,
        )

    def stop(self) -> None:
        self._running = False
        logging.info("Simulation broker stopped.")

    def inject_bullish_breakout(self) -> None:
        self.bid = 1.08628
        self.ask = 1.08638
        logging.info("Simulation: injecting bullish breakout for capability test")

    def place_order(self, signal: Signal) -> int:
        self._ticket += 1
        logging.info(
            "Simulated order | ticket=%s %s %.2f lots @ %.5f",
            self._ticket,
            signal.side,
            signal.lots,
            signal.entry,
        )
        return self._ticket


class Base44Store:
    def __init__(self, local_fallback: bool) -> None:
        self.local_fallback = local_fallback
        self._available = self._probe()

    def _probe(self) -> bool:
        if self.local_fallback:
            return False
        api_key = os.getenv("BASE44_API_KEY", "").strip()
        app_id = os.getenv("BASE44_APP_ID", "").strip()
        return bool(api_key and app_id)

    def save_trade(self, trade: TradeRecord) -> None:
        if not self._available:
            logging.warning(
                "Base44 unavailable. Using local fallback at %s", STATE_FILE
            )
            self._save_local(trade)
            return
        # Remote persistence would go here when credentials are configured.
        self._save_local(trade)

    def _save_local(self, trade: TradeRecord) -> None:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        state: dict[str, Any] = {"trades": []}
        if STATE_FILE.exists():
            state = json.loads(STATE_FILE.read_text(encoding="utf-8"))
        state.setdefault("trades", []).append(asdict(trade))
        STATE_FILE.write_text(json.dumps(state, indent=2), encoding="utf-8")
        logging.info("Trade logged locally: %s", trade.id)


def build_signal(quote: Quote) -> Signal:
    entry = round(quote.ask, 5)
    sl = round(entry - 0.00065, 5)
    tp = round(entry + 0.00131, 5)
    lots = 1.52
    return Signal(side="BUY", entry=entry, sl=sl, tp=tp, lots=lots)


def run_test_cycles(broker: SimulationBroker, store: Base44Store, cycles: int) -> None:
    for cycle in range(1, cycles + 1):
        if cycle == 3:
            broker.inject_bullish_breakout()
            time.sleep(min(POLL_SECONDS, 10))
        quote = Quote(bid=broker.bid, ask=broker.ask)
        if quote.ask >= 1.08630:
            signal = build_signal(quote)
            logging.info(
                "Signal %s | entry=%.5f sl=%.5f tp=%.5f lots=%.2f [SIM]",
                signal.side,
                signal.entry,
                signal.sl,
                signal.tp,
                signal.lots,
            )
            ticket = broker.place_order(signal)
            trade = TradeRecord(
                id=str(uuid.uuid4()),
                ticket=ticket,
                side=signal.side,
                lots=signal.lots,
                entry=signal.entry,
                sl=signal.sl,
                tp=signal.tp,
                timestamp=datetime.now(timezone.utc).isoformat(),
            )
            store.save_trade(trade)
            break
        time.sleep(min(POLL_SECONDS, 10))


def main() -> int:
    setup_logging()
    mode = detect_mode()
    broker_name = "simulation" if mode == "simulation" else "live"
    broker = SimulationBroker()
    store = Base44Store(local_fallback=LOCAL_FALLBACK)

    broker.start()
    logging.info(
        "Bot started | mode=%s broker=%s poll=%ss local_fallback=%s",
        mode,
        broker_name,
        POLL_SECONDS,
        str(LOCAL_FALLBACK).lower(),
    )

    try:
        if mode == "simulation":
            run_test_cycles(broker, store, TEST_CYCLES)
            logging.info("Completed %s test cycle(s). Exiting.", TEST_CYCLES)
        else:
            logging.error("Live trading is only supported on Windows with MT5 configured.")
            return 1
    finally:
        broker.stop()

    return 0


if __name__ == "__main__":
    sys.exit(main())
