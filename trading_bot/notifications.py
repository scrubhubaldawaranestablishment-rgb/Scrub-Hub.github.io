"""Discord and Telegram notification dispatch."""

from __future__ import annotations

import logging

import requests

from trading_bot.config import BotConfig
from trading_bot.credentials import (
    validate_base44,
    validate_discord_url,
    validate_telegram,
)
from trading_bot.models import Signal, TradeRecord

logger = logging.getLogger(__name__)

USER_AGENT = "TradeSentinelBot/2.0"


class Notifier:
    def __init__(self, config: BotConfig) -> None:
        self.config = config
        self.discord_enabled = bool(config.discord_webhook_url)
        self.telegram_enabled = bool(config.telegram_bot_token and config.telegram_chat_id)
        self._session = requests.Session()
        self._session.headers.update({"User-Agent": USER_AGENT})

    def notify_signal(self, signal: Signal) -> None:
        self._send_all(signal.to_alert_message(), label="signal")

    def notify_trade(self, trade: TradeRecord) -> None:
        message = (
            f"Trade Executed on {trade.symbol}\n"
            f"Ticket: #{trade.ticket} | {trade.side} {trade.lots:.2f} lots\n"
            f"Entry: {trade.entry:.5f} | SL: {trade.sl:.5f} | TP: {trade.tp:.5f}\n"
            f"Time: {trade.timestamp}"
        )
        self._send_all(message, label="trade")

    def notify_error(self, symbol: str, error: str, retcode: int = 0) -> None:
        message = f"Execution Error on {symbol}\nCode: {retcode}\n{error}"
        self._send_all(message, label="error")

    def send_test(self) -> dict[str, bool]:
        message = "Trade Sentinel Bot - notification test OK"
        return {
            "discord": self._discord(message),
            "telegram": self._telegram(message),
        }

    def diagnose(self) -> list[str]:
        issues: list[str] = []
        ok, msg = validate_base44(self.config.base44_api_key)
        if not ok:
            issues.append(f"Base44: {msg}")
        ok, msg = validate_discord_url(self.config.discord_webhook_url)
        if self.discord_enabled and not ok:
            issues.append(f"Discord: {msg}")
        ok, msg = validate_telegram(
            self.config.telegram_bot_token,
            self.config.telegram_chat_id,
        )
        if self.telegram_enabled and not ok:
            issues.append(f"Telegram: {msg}")
        return issues

    def _send_all(self, message: str, label: str) -> None:
        discord_ok = self._discord(message) if self.discord_enabled else False
        telegram_ok = self._telegram(message) if self.telegram_enabled else False

        if discord_ok or telegram_ok:
            return

        if not self.discord_enabled and not self.telegram_enabled:
            logger.warning("No notification channels configured - %s alert not sent", label)
            return

        logger.error(
            "%s alert not delivered - Discord=%s Telegram=%s (see errors above)",
            label,
            "FAIL" if self.discord_enabled else "off",
            "FAIL" if self.telegram_enabled else "off",
        )

    def _discord(self, message: str) -> bool:
        url = self.config.discord_webhook_url
        ok, err = validate_discord_url(url)
        if not ok:
            logger.error("Discord: %s", err)
            return False
        try:
            resp = self._session.post(
                url,
                json={"content": message[:1900]},
                timeout=15,
            )
            if resp.status_code == 204 or resp.status_code == 200:
                logger.info("Discord alert sent")
                return True
            logger.error(
                "Discord webhook failed | HTTP %s | %s",
                resp.status_code,
                resp.text[:300],
            )
            return False
        except requests.RequestException as exc:
            logger.error("Discord connection error: %s", exc)
            return False

    def _telegram(self, message: str) -> bool:
        token = self.config.telegram_bot_token
        chat_id = self.config.telegram_chat_id
        ok, err = validate_telegram(token, chat_id)
        if not ok:
            logger.error("Telegram: %s", err)
            return False

        url = f"https://api.telegram.org/bot{token}/sendMessage"
        try:
            resp = self._session.post(
                url,
                json={"chat_id": chat_id, "text": message[:3900]},
                timeout=15,
            )
            data = resp.json() if resp.content else {}
            if resp.ok and data.get("ok"):
                logger.info("Telegram alert sent")
                return True

            desc = data.get("description", resp.text[:300])
            logger.error("Telegram API failed | HTTP %s | %s", resp.status_code, desc)
            if "chat not found" in desc.lower():
                logger.error(
                    "Telegram fix: open your bot in Telegram and press START, "
                    "then re-run test_notifications.bat"
                )
            return False
        except requests.RequestException as exc:
            logger.error("Telegram connection error: %s", exc)
            return False
