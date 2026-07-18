#!/usr/bin/env python3
"""Validate bot folder structure and .env configuration."""

from __future__ import annotations

import logging
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from trading_bot.config import BotConfig
from trading_bot.credentials import (
    clean_env,
    is_placeholder,
    mask_secret,
    validate_discord_url,
    validate_telegram,
)
from trading_bot.env_loader import load_env

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("check_config")

REQUIRED_FILES = ("bot.py", "trading_bot", "bot.env.example", "requirements.txt")


def check_folder() -> list[str]:
    issues: list[str] = []
    cwd = Path.cwd()

    if not (cwd / "bot.py").exists():
        if (cwd.parent / "bot.py").exists():
            issues.append(
                f"WRONG FOLDER: you are in {cwd}\n"
                f"  Fix: cd .."
            )
        elif (cwd / "MT5_Trading_Bot" / "bot.py").exists():
            issues.append(
                f"NESTED CLONE detected in {cwd}\n"
                f"  Fix: cd MT5_Trading_Bot"
            )
        else:
            issues.append(f"bot.py not found in {cwd} — download the full project")

    for name in REQUIRED_FILES:
        if name != "bot.py" and not (cwd / name).exists():
            issues.append(f"Missing required item: {name}")

    return issues


def check_env_file() -> list[str]:
    issues: list[str] = []
    env_path = ROOT / ".env"
    if not env_path.exists():
        issues.append(".env not found — run: copy bot.env.example .env")
        return issues

    load_env()
    return issues


def check_credentials(config: BotConfig) -> list[str]:
    issues: list[str] = []

    if not config.base44_api_key or is_placeholder(config.base44_api_key):
        issues.append("BASE44_API_KEY is empty or placeholder — add your Base44 token")

    ok, msg = validate_discord_url(config.discord_webhook_url)
    if config.discord_webhook_url and not ok:
        issues.append(msg)
    elif not config.discord_webhook_url:
        issues.append("DISCORD_WEBHOOK_URL is empty")

    ok, msg = validate_telegram(config.telegram_bot_token, config.telegram_chat_id)
    if (config.telegram_bot_token or config.telegram_chat_id) and not ok:
        issues.append(msg)
    elif not config.telegram_bot_token or not config.telegram_chat_id:
        issues.append("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is empty")

    return issues


def print_summary(config: BotConfig) -> None:
    logger.info("--- Current configuration ---")
    logger.info("Folder: %s", Path.cwd())
    logger.info("BASE44_API_KEY: %s", mask_secret(config.base44_api_key, 8))
    logger.info("DISCORD_WEBHOOK_URL: %s", mask_secret(config.discord_webhook_url, 24))
    logger.info("TELEGRAM_BOT_TOKEN: %s", mask_secret(config.telegram_bot_token, 8))
    logger.info("TELEGRAM_CHAT_ID: %s", config.telegram_chat_id or "(empty)")
    logger.info("SYMBOLS: %s", ",".join(config.symbols))
    logger.info("BOT_MODE: %s", config.mode)


def main() -> int:
    logger.info("=== Configuration Check ===")

    folder_issues = check_folder()
    for issue in folder_issues:
        logger.error(issue)
    if folder_issues:
        return 1

    env_issues = check_env_file()
    for issue in env_issues:
        logger.error(issue)
    if env_issues:
        return 1

    config = BotConfig()
    print_summary(config)

    cred_issues = check_credentials(config)
    if cred_issues:
        logger.error("--- Configuration problems ---")
        for issue in cred_issues:
            logger.error("  * %s", issue)
        logger.error("")
        logger.error("Edit .env: notepad .env")
        logger.error("Then run: test_notifications.bat")
        return 1

    logger.info("Configuration looks good. Run test_notifications.bat")
    return 0


if __name__ == "__main__":
    sys.exit(main())
