"""Base44 Trade Sentinel dashboard reporting with local JSON fallback."""

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

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.config.base44_api_key}",
            "Content-Type": "application/json",
        }

    def _entity_url(self, entity: str) -> str:
        base = self.config.base44_app_base_url.rstrip("/")
        return f"{base}/api/entities/{entity}"

    def save_trade(self, trade: TradeRecord) -> None:
        if not self._available:
            logger.warning(
                "Base44 unavailable. Using local fallback at %s",
                self.state_path,
            )
            self._save_local(trade)
            return
        try:
            remote_id = self._save_remote(trade)
            logger.info(
                "Trade synced to Trade Sentinel dashboard: %s (%s) remote_id=%s",
                trade.id,
                trade.symbol,
                remote_id,
            )
            self._save_local(trade)
        except requests.RequestException as exc:
            logger.warning("Base44 save failed (%s). Using local fallback.", exc)
            self._save_local(trade)

    def _trade_payload(self, trade: TradeRecord) -> dict[str, Any]:
        return {
            "Symbol": trade.symbol,
            "Type": trade.side,
            "LotSize": trade.lots,
            "EntryPrice": trade.entry,
            "SL": trade.sl,
            "TP": trade.tp,
            "NetProfit": 0,
            "Timestamp": trade.timestamp,
        }

    def _save_remote(self, trade: TradeRecord) -> str:
        # Prefer the dashboard functions endpoint when a bot API key is configured.
        if self.config.base44_bot_api_key:
            return self._save_via_function(trade)

        url = self._entity_url("Trade")
        resp = requests.post(
            url,
            headers=self._headers(),
            json=self._trade_payload(trade),
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        return str(data.get("id", ""))

    def _save_via_function(self, trade: TradeRecord) -> str:
        url = f"{self.config.base44_app_base_url.rstrip('/')}/api/functions/trades"
        payload = {
            "action": trade.side,
            "symbol": trade.symbol,
            "price": trade.entry,
            "sl": trade.sl,
            "tp": trade.tp,
            "lot_size": trade.lots,
            "order_id": trade.ticket,
            "timestamp": trade.timestamp,
        }
        resp = requests.post(
            url,
            headers={
                "Authorization": f"Bearer {self.config.base44_bot_api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        return str(data.get("id") or data.get("trade_id", ""))

    def set_bot_active(self, active: bool = True) -> None:
        if not self._available:
            return
        settings_id = self.config.base44_settings_id
        if not settings_id:
            logger.warning("BASE44_SETTINGS_ID not set — skipping BotActive update")
            return
        url = f"{self._entity_url('Settings')}/{settings_id}"
        resp = requests.put(
            url,
            headers=self._headers(),
            json={"BotActive": active},
            timeout=15,
        )
        if resp.status_code == 405:
            # Some deployments only allow POST create; ignore if update unsupported.
            logger.debug("Settings update not supported via PUT on this deployment")
            return
        resp.raise_for_status()
        logger.info("Dashboard BotActive set to %s", active)

    def _save_local(self, trade: TradeRecord) -> None:
        self.state_path.parent.mkdir(parents=True, exist_ok=True)
        state: dict[str, Any] = {"trades": []}
        if self.state_path.exists():
            state = json.loads(self.state_path.read_text(encoding="utf-8"))
        state.setdefault("trades", []).append(trade.to_dict())
        self.state_path.write_text(json.dumps(state, indent=2), encoding="utf-8")
        logger.info("Trade logged locally: %s", trade.id)
