"""Sanitize and validate credentials from .env files."""

from __future__ import annotations

import os
import re


def clean_env(key: str, default: str = "") -> str:
    raw = os.getenv(key, default)
    if raw is None:
        return ""
    value = str(raw).strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
        value = value[1:-1].strip()
    return value


def is_placeholder(value: str) -> bool:
    if not value:
        return True
    lower = value.lower()
    markers = (
        "your_",
        "your-",
        "paste",
        "example",
        "changeme",
        "replace",
        "xxx",
        "your_webhook",
        "your_token",
    )
    return any(m in lower for m in markers)


def validate_discord_url(url: str) -> tuple[bool, str]:
    if not url:
        return False, "DISCORD_WEBHOOK_URL is empty"
    if is_placeholder(url):
        return False, "DISCORD_WEBHOOK_URL still has placeholder text — paste your real webhook URL"
    if not re.match(r"^https://(discord\.com|discordapp\.com)/api/webhooks/\d+/[\w-]+$", url):
        return (
            False,
            "DISCORD_WEBHOOK_URL format invalid — must be "
            "https://discord.com/api/webhooks/ID/TOKEN",
        )
    return True, ""


def validate_telegram(token: str, chat_id: str) -> tuple[bool, str]:
    if not token or not chat_id:
        return False, "TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are both required"
    if is_placeholder(token) or is_placeholder(chat_id):
        return False, "Telegram credentials still have placeholder values in .env"
    if not re.match(r"^\d+:[A-Za-z0-9_-]+$", token):
        return (
            False,
            "TELEGRAM_BOT_TOKEN format invalid — should look like 123456789:ABCdefGHI...",
        )
    if not re.match(r"^-?\d+$", chat_id):
        return False, "TELEGRAM_CHAT_ID must be a number (e.g. 123456789 or -1001234567890)"
    return True, ""


def mask_secret(value: str, show: int = 6) -> str:
    if not value:
        return "(empty)"
    if len(value) <= show * 2:
        return "*" * len(value)
    return f"{value[:show]}...{value[-show:]}"
