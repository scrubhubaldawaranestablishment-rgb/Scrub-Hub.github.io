"""Load environment variables from .env before config is read."""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

from trading_bot.credentials import clean_env

_ROOT = Path(__file__).resolve().parents[1]
_ENV_CANDIDATES = (_ROOT / ".env", _ROOT / "bot.env")


def load_env() -> Path | None:
    for path in _ENV_CANDIDATES:
        if path.exists():
            # override=True ensures .env wins over empty system variables
            load_dotenv(path, override=True, encoding="utf-8")
            return path
    return None


def env_status() -> dict[str, bool]:
    return {
        "base44": bool(clean_env("BASE44_API_KEY") or clean_env("Base44_API_Token")),
        "discord": bool(clean_env("DISCORD_WEBHOOK_URL")),
        "telegram": bool(clean_env("TELEGRAM_BOT_TOKEN") and clean_env("TELEGRAM_CHAT_ID")),
    }
