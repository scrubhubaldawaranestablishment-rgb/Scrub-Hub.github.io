#!/bin/bash
set -euo pipefail

# CreatorPilot AI — Vercel frontend deploy helper
# Requires: npx vercel (or npm install vercel in repo root)

RAILWAY_API_URL="${RAILWAY_API_URL:-https://scrub-hubgithubio-production.up.railway.app}"
PROJECT_NAME="${VERCEL_PROJECT_NAME:-creatorpilot-ai}"
ROOT_DIR="apps/web"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         CreatorPilot AI — Vercel Frontend Deploy             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Railway API: $RAILWAY_API_URL"
echo "Root dir:    $ROOT_DIR"
echo ""

if ! npx vercel whoami >/dev/null 2>&1; then
  echo "Not logged in to Vercel. Run:"
  echo "  cd $ROOT_DIR && npx vercel login"
  echo ""
  echo "Or set VERCEL_TOKEN from https://vercel.com/account/tokens"
  exit 1
fi

cd "$(dirname "$0")/.."
cd "$ROOT_DIR"

if [ ! -d .vercel ]; then
  echo "Linking Vercel project..."
  npx vercel link --yes --project "$PROJECT_NAME" 2>/dev/null || \
    npx vercel link --yes
fi

echo "Setting API_PROXY_TARGET for production..."
printf '%s' "$RAILWAY_API_URL" | npx vercel env add API_PROXY_TARGET production --force 2>/dev/null || \
  printf '%s' "$RAILWAY_API_URL" | npx vercel env add API_PROXY_TARGET production

echo "Setting API_PROXY_TARGET for preview..."
printf '%s' "$RAILWAY_API_URL" | npx vercel env add API_PROXY_TARGET preview --force 2>/dev/null || \
  printf '%s' "$RAILWAY_API_URL" | npx vercel env add API_PROXY_TARGET preview

echo ""
echo "Deploying to production..."
DEPLOY_URL=$(npx vercel deploy --prod --yes 2>&1 | tee /dev/stderr | grep -oE 'https://[a-zA-Z0-9.-]+\.vercel\.app' | tail -1)

if [ -n "$DEPLOY_URL" ]; then
  echo ""
  echo "✓ Deployed: $DEPLOY_URL"
  echo ""
  echo "Update Railway CORS_ORIGIN:"
  echo "  cd .. && npx railway variable set CORS_ORIGIN=$DEPLOY_URL"
  echo ""
  echo "Test login: $DEPLOY_URL/login"
  echo "  demo@creatorpilot.ai / demo1234"
else
  echo ""
  echo "Deploy finished. Check Vercel dashboard for your URL."
fi
