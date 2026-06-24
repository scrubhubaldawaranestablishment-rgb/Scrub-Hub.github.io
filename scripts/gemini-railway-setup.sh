#!/bin/bash
set -euo pipefail

# CreatorPilot — quickest Railway Gemini setup (run after: railway login)
# Usage:
#   GEMINI_API_KEY=your-key ./scripts/gemini-railway-setup.sh
# Or add GEMINI_API_KEY to Cursor Cloud Agent secrets and run:
#   ./scripts/gemini-railway-setup.sh

unset RAILWAY_TOKEN RAILWAY_API_TOKEN

SERVICE="${RAILWAY_SERVICE:-Scrub-Hub.github.io}"
MODEL="${GEMINI_MODEL:-gemini-2.0-flash}"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     CreatorPilot — Railway Gemini AI (quick setup)           ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

if ! npx railway whoami >/dev/null 2>&1; then
  echo "1. Run:  npx railway login"
  echo "2. Then re-run this script"
  exit 1
fi

echo "→ Setting GEMINI_MODEL=$MODEL"
npx railway variable set "GEMINI_MODEL=$MODEL" --service "$SERVICE"

if [ -n "${GEMINI_API_KEY:-}" ]; then
  echo "→ Setting GEMINI_API_KEY (from environment)"
  npx railway variable set "GEMINI_API_KEY=$GEMINI_API_KEY" --service "$SERVICE"
else
  echo ""
  echo "⚠ GEMINI_API_KEY not set in this shell."
  echo "  Get a free key: https://aistudio.google.com/apikey"
  echo "  Then either:"
  echo "    GEMINI_API_KEY=your-key ./scripts/gemini-railway-setup.sh"
  echo "  Or in Railway dashboard → API service → Variables → add GEMINI_API_KEY"
  echo ""
fi

echo "→ Removing old OpenAI variables (if any)"
npx railway variable delete OPENAI_API_KEY --service "$SERVICE" -y 2>/dev/null || true
npx railway variable delete OPENAI_MODEL --service "$SERVICE" -y 2>/dev/null || true

echo ""
echo "→ Redeploying API..."
npx railway redeploy --service "$SERVICE" --from-source -y

echo ""
echo "✓ Done. Test: https://my-respository2.vercel.app/dashboard/trends"
echo "  Badge should say 'Gemini AI' after you add GEMINI_API_KEY and redeploy completes."
