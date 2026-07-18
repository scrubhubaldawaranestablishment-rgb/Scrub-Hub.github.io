#!/usr/bin/env python3
"""Multi-symbol MT5 trading bot entry point."""

from __future__ import annotations

import logging
import sys

from trading_bot.config import BotConfig
from trading_bot.env_loader import env_status, load_env
from trading_bot.scanner import MultiSymbolScanner

logger = logging.getLogger(__name__)


def setup_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)-8s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )


def log_startup(config: BotConfig) -> None:
    status = env_status()
    logger.info("Symbols: %s", ",".join(config.symbols))
    logger.info("Dashboard: %s", config.base44_app_base_url)
    logger.info(
        "Integrations | Base44=%s Discord=%s Telegram=%s",
        "ON" if status["base44"] else "OFF",
        "ON" if status["discord"] else "OFF",
        "ON" if status["telegram"] else "OFF",
    )
    if not status["discord"]:
        logger.warning("DISCORD_WEBHOOK_URL not set — Discord alerts disabled")
    if not status["telegram"]:
        logger.warning(
            "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — Telegram alerts disabled"
        )
    if not status["base44"]:
        logger.warning("BASE44_API_KEY not set — dashboard sync will use local fallback")


def main() -> int:
    env_path = load_env()
    setup_logging()
    if env_path:
        logger.info("Loaded config from %s", env_path.name)
    else:
        logger.warning(
            "No .env file found. Copy bot.env.example to .env and add your API keys."
        )

    config = BotConfig()
    log_startup(config)
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
            logger.info("Shutdown requested.")
        finally:
            scanner.on_deinit()

    return 0


if __name__ == "__main__":
    sys.exit(main())
