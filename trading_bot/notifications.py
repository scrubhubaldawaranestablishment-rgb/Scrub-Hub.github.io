"""Discord and Telegram notification dispatch."""

from __future__ import annotations

import logging
from typing import Any

import requests

from trading_bot.config import BotConfig
from trading_bot.models import Signal, TradeRecord

logger = logging.getLogger(__name__)


class Notifier:
    def __init__(self, config: BotConfig) -> None:
        self.config = config

    def notify_signal(self, signal: Signal) -> None:
        message = signal.to_alert_message()
        self._send_all(message, payload_extra={"type": "signal", "symbol": signal.symbol})

    def notify_trade(self, trade: TradeRecord) -> None:
        message = (
            f"✅ Trade Executed on {trade.symbol}\n"
            f"Ticket: {trade.ticket} | {trade.side} {trade.lots:.2f} lots @ {trade.entry:.5f}\n"
            f"SL: {trade.sl:.5f} | TP: {trade.tp:.5f}\n"
            f"Time: {trade.timestamp}"
        )
        self._send_all(message, payload_extra={"type": "trade", "symbol": trade.symbol})

    def notify_error(self, symbol: str, error: str, retcode: int = 0) -> None:
        message = f"❌ Execution Error on {symbol}\nCode: {retcode}\n{error}"
        self._send_all(message, payload_extra={"type": "error", "symbol": symbol})

    def _send_all(self, message: str, payload_extra: dict[str, Any] | None = None) -> None:
        self._discord(message)
        self._telegram(message)

    def _discord(self, message: str) -> None:
        url = self.config.discord_webhook_url.strip()
        if not url:
            return
        try:
            resp = requests.post(url, json={"content": message}, timeout=10)
            resp.raise_for_status()
        except requests.RequestException as exc:
            logger.warning("Discord webhook failed: %s", exc)

    def _telegram(self, message: str) -> None:
        token = self.config.telegram_bot_token.strip()
        chat_id = self.config.telegram_chat_id.strip()
        if not token or not chat_id:
            return
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        try:
            resp = requests.post(
                url,
                json={"chat_id": chat_id, "text": message, "parse_mode": "HTML"},
                timeout=10,
            )
            resp.raise_for_status()
        except requests.RequestException as exc:
            logger.warning("Telegram notification failed: %s", exc)
