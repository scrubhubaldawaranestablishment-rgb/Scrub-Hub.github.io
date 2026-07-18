#!/usr/bin/env python3
"""
Live integration test for Trade Sentinel dashboard.

Pushes multi-symbol simulated trades to:
  https://nondescript-trade-sentinel-pro.base44.app

Usage:
  export BASE44_API_KEY="$Base44_API_Token"   # or set in environment
  python3 scripts/test_dashboard_live.py
"""

from __future__ import annotations

import logging
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from trading_bot.base44_store import Base44Store
from trading_bot.config import BotConfig
from trading_bot.models import TradeRecord
from trading_bot.scanner import MultiSymbolScanner

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("dashboard_test")


def push_demo_trades(store: Base44Store) -> list[TradeRecord]:
    now = datetime.now(timezone.utc).isoformat()
    demos = [
        ("EURUSD", "BUY", 1.08633, 1.08568, 1.08764, 1.52),
        ("GBPUSD", "SELL", 1.26543, 1.26693, 1.26243, 0.67),
        ("USDJPY", "BUY", 157.450, 157.300, 157.750, 0.50),
        ("AUDUSD", "SELL", 0.65286, 0.65436, 0.64986, 0.89),
    ]
    saved: list[TradeRecord] = []
    for symbol, side, entry, sl, tp, lots in demos:
        trade = TradeRecord(
            id=str(uuid.uuid4()),
            ticket=100_000 + len(saved) + 1,
            symbol=symbol,
            side=side,
            lots=lots,
            entry=entry,
            sl=sl,
            tp=tp,
            timestamp=now,
            comment="dashboard_live_test",
        )
        store.save_trade(trade)
        saved.append(trade)
        logger.info("Pushed %s %s @ %.5f to dashboard", side, symbol, entry)
    return saved


def run_bot_scan() -> None:
    logger.info("Running multi-symbol bot scan (simulation)...")
    scanner = MultiSymbolScanner(BotConfig())
    scanner.on_init()
    try:
        signals = scanner.scan_all_pairs()
        logger.info("Bot scan produced %s signal(s)", len(signals))
    finally:
        scanner.on_deinit()


def main() -> int:
    config = BotConfig()
    if not config.base44_api_key:
        logger.error(
            "BASE44_API_KEY (or Base44_API_Token) is required for dashboard sync"
        )
        return 1

    logger.info("Dashboard: %s", config.base44_app_base_url)
    logger.info("App ID: %s", config.base44_app_id)

    store = Base44Store(config)
    if not store._available:
        logger.error("Base44 store not available — check credentials")
        return 1

    logger.info("=== Phase 1: Push demo multi-symbol trades ===")
    push_demo_trades(store)

    logger.info("=== Phase 2: Run bot scan (may add another live trade) ===")
    run_bot_scan()

    logger.info(
        "Done. Open the dashboard to see live trades: %s",
        config.base44_app_base_url,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
