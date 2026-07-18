"""Discord and Telegram notification dispatch."""

from __future__ import annotations

import logging

import requests

from trading_bot.config import BotConfig
from trading_bot.models import Signal, TradeRecord

logger = logging.getLogger(__name__)


class Notifier:
    def __init__(self, config: BotConfig) -> None:
        self.config = config
        self.discord_enabled = bool(config.discord_webhook_url.strip())
        self.telegram_enabled = bool(
            config.telegram_bot_token.strip() and config.telegram_chat_id.strip()
        )

    def notify_signal(self, signal: Signal) -> None:
        message = signal.to_alert_message()
        self._send_all(message, label="signal")

    def notify_trade(self, trade: TradeRecord) -> None:
        message = (
            f"✅ Trade Executed on {trade.symbol}\n"
            f"Ticket: #{trade.ticket} | {trade.side} {trade.lots:.2f} lots\n"
            f"Entry: {trade.entry:.5f} | SL: {trade.sl:.5f} | TP: {trade.tp:.5f}\n"
            f"Time: {trade.timestamp}"
        )
        self._send_all(message, label="trade")

    def notify_error(self, symbol: str, error: str, retcode: int = 0) -> None:
        message = f"❌ Execution Error on {symbol}\nCode: {retcode}\n{error}"
        self._send_all(message, label="error")

    def send_test(self) -> dict[str, bool]:
        message = (
            "🔔 Trade Sentinel Bot — notification test\n"
            "Discord and Telegram are connected and working."
        )
        return {
            "discord": self._discord(message),
            "telegram": self._telegram(message),
        }

    def _send_all(self, message: str, label: str) -> None:
        discord_ok = self._discord(message)
        telegram_ok = self._telegram(message)
        if not discord_ok and not telegram_ok:
            if not self.discord_enabled and not self.telegram_enabled:
                logger.warning(
                    "No notification channels configured — %s alert not sent", label
                )

    def _discord(self, message: str) -> bool:
        url = self.config.discord_webhook_url.strip()
        if not url:
            return False
        try:
            resp = requests.post(url, json={"content": message}, timeout=10)
            resp.raise_for_status()
            logger.info("Discord alert sent")
            return True
        except requests.RequestException as exc:
            logger.error("Discord webhook failed: %s", exc)
            return False

    def _telegram(self, message: str) -> bool:
        token = self.config.telegram_bot_token.strip()
        chat_id = self.config.telegram_chat_id.strip()
        if not token or not chat_id:
            return False
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        try:
            resp = requests.post(
                url,
                json={"chat_id": chat_id, "text": message},
                timeout=10,
            )
            resp.raise_for_status()
            logger.info("Telegram alert sent")
            return True
        except requests.RequestException as exc:
            logger.error("Telegram notification failed: %s", exc)
            return False
