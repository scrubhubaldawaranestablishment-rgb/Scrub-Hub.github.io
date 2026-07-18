"""Bot configuration loaded from environment variables."""

from __future__ import annotations

import json
import os
from dataclasses import dataclass, field


def _symbols_from_env() -> list[str]:
    raw = os.getenv("SYMBOLS_TO_TRADE", "EURUSD,GBPUSD,USDJPY,AUDUSD")
    if raw.strip().startswith("["):
        return [s.upper() for s in json.loads(raw)]
    return [s.strip().upper() for s in raw.split(",") if s.strip()]


@dataclass(frozen=True)
class BotConfig:
    mode: str = os.getenv("BOT_MODE", "auto")
    symbols: list[str] = field(default_factory=_symbols_from_env)
    poll_seconds: int = int(os.getenv("BOT_POLL_SECONDS", "10"))
    test_cycles: int = int(os.getenv("BOT_TEST_CYCLES", "0"))

    # Timeframes (MT5 constants mirrored for simulation)
    htf: str = os.getenv("HTF_TIMEFRAME", "H1")
    ltf: str = os.getenv("LTF_TIMEFRAME", "M5")
    bars_lookback: int = int(os.getenv("BARS_LOOKBACK", "200"))

    # Risk per symbol
    max_open_trades_per_symbol: int = int(os.getenv("MAX_OPEN_TRADES_PER_SYMBOL", "1"))
    max_spread_points: int = int(os.getenv("MAX_SPREAD_POINTS", "25"))
    risk_percent: float = float(os.getenv("RISK_PERCENT", "1.0"))
    default_sl_pips: float = float(os.getenv("DEFAULT_SL_PIPS", "15.0"))
    default_tp_pips: float = float(os.getenv("DEFAULT_TP_PIPS", "30.0"))
    max_concurrent_signals: int = int(os.getenv("MAX_CONCURRENT_SIGNALS", "3"))
    min_free_margin_pct: float = float(os.getenv("MIN_FREE_MARGIN_PCT", "30.0"))

    # Strategy
    rsi_period: int = int(os.getenv("RSI_PERIOD", "14"))
    rsi_oversold: float = float(os.getenv("RSI_OVERSOLD", "35.0"))
    rsi_overbought: float = float(os.getenv("RSI_OVERBOUGHT", "65.0"))
    ema_fast: int = int(os.getenv("EMA_FAST", "20"))
    ema_slow: int = int(os.getenv("EMA_SLOW", "50"))

    # Integrations
    local_fallback: bool = os.getenv("BOT_LOCAL_FALLBACK", "false").lower() == "true"
    base44_api_key: str = os.getenv("BASE44_API_KEY", "")
    base44_app_id: str = os.getenv("BASE44_APP_ID", "")
    discord_webhook_url: str = os.getenv("DISCORD_WEBHOOK_URL", "")
    telegram_bot_token: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    telegram_chat_id: str = os.getenv("TELEGRAM_CHAT_ID", "")

    magic_number: int = int(os.getenv("MAGIC_NUMBER", "20260716"))
    state_file: str = os.getenv("BOT_STATE_FILE", "data/bot_state.json")
