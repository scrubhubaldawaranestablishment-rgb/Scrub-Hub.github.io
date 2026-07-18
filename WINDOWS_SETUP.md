# MT5 Multi-Symbol Trading Bot — Windows Quick Start

> **If `setup.bat` is not recognized** → your folder is outdated.  
> Read **`START_HERE.txt`** or run the commands in **Option A** below.

## Option A — Get the latest code (fix missing setup.bat)

Open **CMD** and run:

```cmd
cd C:\Users\elmep\Downloads
git clone -b cursor/python-bot-script-9399 https://github.com/scrubhubaldawaranestablishment-rgb/Scrub-Hub.github.io.git MT5_Trading_Bot
cd MT5_Trading_Bot
setup.bat
```

**No git?** Download ZIP:  
https://github.com/scrubhubaldawaranestablishment-rgb/Scrub-Hub.github.io/archive/refs/heads/cursor/python-bot-script-9399.zip

Extract to `C:\Users\elmep\Downloads\MT5_Trading_Bot`, then double-click `setup.bat`.

---

## Option B — Already have the latest files

Double-click **`setup.bat`** or **`INSTALL.bat`** in CMD:

```cmd
cd C:\Users\elmep\Downloads\MT5_Trading_Bot
setup.bat
```

You are on **Windows CMD**. Do **not** use Linux commands like `export` or `BOT_TEST_CYCLES=5 python3 bot.py`.

## 1. Setup (one time)

Double-click **`setup.bat`** or run in CMD:

```cmd
cd C:\Users\elmep\Downloads\MT5_Trading_Bot
setup.bat
```

This will:
- Install Python dependencies
- Create `.env` from `bot.env.example`
- Open Notepad so you can paste your API keys

## 2. Edit `.env` — required keys

```env
BASE44_API_KEY=your_base44_token_here

DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/XXXX/YYYY
TELEGRAM_BOT_TOKEN=123456789:ABCdef...
TELEGRAM_CHAT_ID=123456789
```

### How to get Discord webhook
1. Open your Discord server → Channel Settings → Integrations → Webhooks
2. Create webhook → Copy webhook URL → paste into `.env`

### How to get Telegram credentials
1. Message **@BotFather** on Telegram → `/newbot` → copy the token
2. Message **@userinfobot** → copy your chat ID
3. Paste both into `.env`

## 3. Run tests

| Script | What it does |
|--------|-------------|
| `test_notifications.bat` | Sends test messages to Discord + Telegram |
| `run_dashboard_test.bat` | Pushes live trades to your dashboard |
| `run_test.bat` | Runs 5-cycle simulation test |
| `run_bot.bat` | Runs bot continuously (live MT5 on Windows) |

## 4. Dashboard

Open: https://nondescript-trade-sentinel-pro.base44.app

Trades appear in the table within ~5 seconds.

## Troubleshooting

| Error | Fix |
|-------|-----|
| `'export' is not recognized` | Use `.env` file + `.bat` scripts, not Linux commands |
| `'python3' is not recognized` | Use `py -3` or `python` — the `.bat` files handle this |
| No Discord/Telegram messages | Run `test_notifications.bat` and check `.env` values |
| No dashboard trades | Check `BASE44_API_KEY` in `.env`, run `run_dashboard_test.bat` |
