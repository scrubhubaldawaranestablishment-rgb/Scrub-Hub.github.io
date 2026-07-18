#!/usr/bin/env python3
"""Multi-symbol MT5 trading bot entry point."""

from __future__ import annotations

import logging
import sys

from trading_bot.config import BotConfig
from trading_bot.scanner import MultiSymbolScanner


def setup_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)-8s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )


def main() -> int:
    setup_logging()
    config = BotConfig()
    scanner = MultiSymbolScanner(config)

    if config.test_cycles > 0:
        scanner.run_forever()
    else:
        scanner.on_init()
        try:
            while True:
                scanner.scan_all_pairs()
                import time

                time.sleep(config.poll_seconds)
        except KeyboardInterrupt:
            logging.info("Shutdown requested.")
        finally:
            scanner.on_deinit()

    return 0


if __name__ == "__main__":
    sys.exit(main())
