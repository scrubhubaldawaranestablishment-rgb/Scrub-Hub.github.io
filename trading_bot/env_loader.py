"""Load environment variables from .env before config is read."""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

_ROOT = Path(__file__).resolve().parents[1]
_ENV_CANDIDATES = (_ROOT / ".env", _ROOT / "bot.env")


def load_env() -> Path | None:
    for path in _ENV_CANDIDATES:
        if path.exists():
            load_dotenv(path, override=False)
            return path
    return None


def env_status() -> dict[str, bool]:
    return {
        "base44": bool(os.getenv("BASE44_API_KEY") or os.getenv("Base44_API_Token")),
        "discord": bool(os.getenv("DISCORD_WEBHOOK_URL", "").strip()),
        "telegram": bool(
            os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
            and os.getenv("TELEGRAM_CHAT_ID", "").strip()
        ),
    }
