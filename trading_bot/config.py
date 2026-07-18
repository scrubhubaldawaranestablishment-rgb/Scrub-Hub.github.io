"""Bot configuration loaded from environment variables."""

from __future__ import annotations

import json
import os
from dataclasses import dataclass, field

from trading_bot.credentials import clean_env


def _symbols_from_env() -> list[str]:
    raw = clean_env("SYMBOLS_TO_TRADE", "EURUSD,GBPUSD,USDJPY,AUDUSD")
    if raw.strip().startswith("["):
        return [s.upper() for s in json.loads(raw)]
    return [s.strip().upper() for s in raw.split(",") if s.strip()]


@dataclass(frozen=True)
class BotConfig:
    mode: str = clean_env("BOT_MODE", "auto")
    symbols: list[str] = field(default_factory=_symbols_from_env)
    poll_seconds: int = int(clean_env("BOT_POLL_SECONDS", "10"))
    test_cycles: int = int(clean_env("BOT_TEST_CYCLES", "0"))

    # Timeframes (MT5 constants mirrored for simulation)
    htf: str = clean_env("HTF_TIMEFRAME", "H1")
    ltf: str = clean_env("LTF_TIMEFRAME", "M5")
    bars_lookback: int = int(clean_env("BARS_LOOKBACK", "200"))

    # Risk per symbol
    max_open_trades_per_symbol: int = int(clean_env("MAX_OPEN_TRADES_PER_SYMBOL", "1"))
    max_spread_points: int = int(clean_env("MAX_SPREAD_POINTS", "25"))
    risk_percent: float = float(clean_env("RISK_PERCENT", "1.0"))
    default_sl_pips: float = float(clean_env("DEFAULT_SL_PIPS", "15.0"))
    default_tp_pips: float = float(clean_env("DEFAULT_TP_PIPS", "30.0"))
    max_concurrent_signals: int = int(clean_env("MAX_CONCURRENT_SIGNALS", "3"))
    min_free_margin_pct: float = float(clean_env("MIN_FREE_MARGIN_PCT", "30.0"))

    # Strategy
    rsi_period: int = int(clean_env("RSI_PERIOD", "14"))
    rsi_oversold: float = float(clean_env("RSI_OVERSOLD", "35.0"))
    rsi_overbought: float = float(clean_env("RSI_OVERBOUGHT", "65.0"))
    ema_fast: int = int(clean_env("EMA_FAST", "20"))
    ema_slow: int = int(clean_env("EMA_SLOW", "50"))

    # Integrations
    local_fallback: bool = clean_env("BOT_LOCAL_FALLBACK", "false").lower() == "true"
    base44_api_key: str = clean_env("BASE44_API_KEY") or clean_env("Base44_API_Token")
    base44_app_id: str = clean_env("BASE44_APP_ID", "6a5889155e63aca9fe8175e5")
    base44_app_base_url: str = clean_env(
        "BASE44_APP_BASE_URL",
        "https://nondescript-trade-sentinel-pro.base44.app",
    )
    base44_bot_api_key: str = clean_env("BASE44_BOT_API_KEY")
    base44_settings_id: str = clean_env("BASE44_SETTINGS_ID", "6a5889a0b628948d90d3f8bd")
    discord_webhook_url: str = clean_env("DISCORD_WEBHOOK_URL")
    telegram_bot_token: str = clean_env("TELEGRAM_BOT_TOKEN")
    telegram_chat_id: str = clean_env("TELEGRAM_CHAT_ID")

    magic_number: int = int(clean_env("MAGIC_NUMBER", "20260716"))
    state_file: str = clean_env("BOT_STATE_FILE", "data/bot_state.json")
