"""Base44 dashboard reporting with local JSON fallback."""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

import requests

from trading_bot.config import BotConfig
from trading_bot.models import TradeRecord

logger = logging.getLogger(__name__)


class Base44Store:
    def __init__(self, config: BotConfig) -> None:
        self.config = config
        self.state_path = Path(config.state_file)
        self._available = self._probe()

    def _probe(self) -> bool:
        if self.config.local_fallback:
            return False
        return bool(self.config.base44_api_key and self.config.base44_app_id)

    def save_trade(self, trade: TradeRecord) -> None:
        if not self._available:
            logger.warning(
                "Base44 unavailable. Using local fallback at %s",
                self.state_path,
            )
            self._save_local(trade)
            return
        try:
            self._save_remote(trade)
        except requests.RequestException as exc:
            logger.warning("Base44 save failed (%s). Using local fallback.", exc)
            self._save_local(trade)

    def _save_remote(self, trade: TradeRecord) -> None:
        # Base44 entity endpoint pattern — adjust entity name to match your schema.
        url = f"https://api.base44.com/v1/apps/{self.config.base44_app_id}/entities/Trade"
        headers = {
            "Authorization": f"Bearer {self.config.base44_api_key}",
            "Content-Type": "application/json",
        }
        resp = requests.post(url, headers=headers, json=trade.to_dict(), timeout=15)
        resp.raise_for_status()
        logger.info("Trade synced to Base44: %s (%s)", trade.id, trade.symbol)

    def _save_local(self, trade: TradeRecord) -> None:
        self.state_path.parent.mkdir(parents=True, exist_ok=True)
        state: dict[str, Any] = {"trades": []}
        if self.state_path.exists():
            state = json.loads(self.state_path.read_text(encoding="utf-8"))
        state.setdefault("trades", []).append(trade.to_dict())
        self.state_path.write_text(json.dumps(state, indent=2), encoding="utf-8")
        logger.info("Trade logged locally: %s", trade.id)
