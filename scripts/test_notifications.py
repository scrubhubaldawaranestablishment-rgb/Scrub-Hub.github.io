#!/usr/bin/env python3
"""Test Discord and Telegram notification delivery."""

from __future__ import annotations

import logging
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from trading_bot.config import BotConfig
from trading_bot.credentials import mask_secret, validate_discord_url, validate_telegram
from trading_bot.env_loader import env_status, load_env
from trading_bot.models import Side, Signal, TradeRecord
from trading_bot.notifications import Notifier

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("notify_test")


def print_credential_help() -> None:
    logger.error("")
    logger.error("HOW TO FIX .env:")
    logger.error("  Discord: Server -> Channel Settings -> Integrations -> Webhooks -> New Webhook")
    logger.error("           Copy URL into DISCORD_WEBHOOK_URL (no quotes)")
    logger.error("  Telegram: Message @BotFather -> /newbot -> copy token")
    logger.error("            Message @userinfobot -> copy ID into TELEGRAM_CHAT_ID")
    logger.error("            Open your bot chat and press START before testing")
    logger.error("")


def main() -> int:
    env_path = load_env()
    if not env_path:
        logger.error("No .env file found. Run setup.bat first.")
        return 1

    config = BotConfig()
    status = env_status()
    notifier = Notifier(config)

    logger.info("Loaded: %s", env_path)
    logger.info("Discord configured: %s", status["discord"])
    logger.info("Telegram configured: %s", status["telegram"])

    if config.discord_webhook_url:
        logger.info("Discord URL: %s", mask_secret(config.discord_webhook_url, 30))
    if config.telegram_bot_token:
        logger.info("Telegram token: %s", mask_secret(config.telegram_bot_token, 8))
        logger.info("Telegram chat: %s", config.telegram_chat_id)

    issues = notifier.diagnose()
    for issue in issues:
        logger.error(issue)

    if issues:
        print_credential_help()
        return 1

    if not status["discord"] and not status["telegram"]:
        logger.error("Add DISCORD_WEBHOOK_URL and/or TELEGRAM credentials to .env")
        print_credential_help()
        return 1

    logger.info("=== Test 1: Connection ping ===")
    results = notifier.send_test()
    logger.info("Results: discord=%s telegram=%s", results["discord"], results["telegram"])

    if not any(results.values()):
        print_credential_help()
        return 1

    logger.info("=== Test 2: Sample trade signal ===")
    signal = Signal(
        symbol="EURUSD",
        side=Side.BUY,
        entry=1.08633,
        sl=1.08568,
        tp=1.08764,
        lots=1.52,
        htf_trend="bullish",
        ltf_reason="RSI crossover test",
        spread_points=10.0,
        simulated=True,
    )
    notifier.notify_signal(signal)

    logger.info("=== Test 3: Sample executed trade ===")
    trade = TradeRecord(
        id="test-trade-001",
        ticket=100001,
        symbol="EURUSD",
        side="BUY",
        lots=1.52,
        entry=1.08633,
        sl=1.08568,
        tp=1.08764,
        timestamp="2026-07-18T15:00:00+00:00",
    )
    notifier.notify_trade(trade)

    logger.info("SUCCESS - check Discord channel and Telegram chat for 3 messages.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
