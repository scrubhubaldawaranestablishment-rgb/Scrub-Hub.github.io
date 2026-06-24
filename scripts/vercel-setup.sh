#!/bin/bash
set -euo pipefail

# CreatorPilot AI — Vercel frontend deploy helper
# Requires VERCEL_TOKEN (https://vercel.com/account/tokens) or `vercel login`

RAILWAY_API_URL="${RAILWAY_API_URL:-https://scrub-hubgithubio-production.up.railway.app}"
PROJECT_NAME="${VERCEL_PROJECT_NAME:-creatorpilot-ai}"
ROOT_DIR="apps/web"

vercel_cli() {
  if [ -n "${VERCEL_TOKEN:-}" ]; then
    npx vercel "$@" --token "$VERCEL_TOKEN"
  else
    npx vercel "$@"
  fi
}

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         CreatorPilot AI — Vercel Frontend Deploy             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Railway API: $RAILWAY_API_URL"
echo "Root dir:    $ROOT_DIR"
echo ""

if [ -z "${VERCEL_TOKEN:-}" ]; then
  if ! timeout 10 npx vercel whoami >/dev/null 2>&1; then
    echo "Set VERCEL_TOKEN (Cursor Cloud Agent secret or export locally)."
    echo "Create at https://vercel.com/account/tokens"
    echo "Use secret type: Runtime Secret or Environment Variable (not Build Secret)."
    exit 1
  fi
else
  if ! vercel_cli whoami >/dev/null 2>&1; then
    echo "VERCEL_TOKEN is set but invalid. Create a new token at https://vercel.com/account/tokens"
    exit 1
  fi
  echo "Authenticated with VERCEL_TOKEN"
fi

cd "$(dirname "$0")/.."
cd "$ROOT_DIR"

if [ ! -d .vercel ]; then
  echo "Linking Vercel project..."
  vercel_cli link --yes --project "$PROJECT_NAME" 2>/dev/null || vercel_cli link --yes
fi

echo "Setting API_PROXY_TARGET for production..."
printf '%s' "$RAILWAY_API_URL" | vercel_cli env add API_PROXY_TARGET production --force 2>/dev/null || \
  printf '%s' "$RAILWAY_API_URL" | vercel_cli env add API_PROXY_TARGET production

echo "Setting API_PROXY_TARGET for preview..."
printf '%s' "$RAILWAY_API_URL" | vercel_cli env add API_PROXY_TARGET preview --force 2>/dev/null || \
  printf '%s' "$RAILWAY_API_URL" | vercel_cli env add API_PROXY_TARGET preview

echo ""
echo "Deploying to production..."
DEPLOY_OUTPUT=$(vercel_cli deploy --prod --yes 2>&1 | tee /dev/stderr)
DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://[a-zA-Z0-9.-]+\.vercel\.app' | tail -1)

if [ -n "$DEPLOY_URL" ]; then
  echo ""
  echo "✓ Deployed: $DEPLOY_URL"
  echo ""
  echo "Update Railway CORS_ORIGIN:"
  echo "  unset RAILWAY_TOKEN RAILWAY_API_TOKEN && npx railway variable set CORS_ORIGIN=$DEPLOY_URL"
  echo ""
  echo "Test login: $DEPLOY_URL/login"
  echo "  demo@creatorpilot.ai / demo1234"
else
  echo ""
  echo "Deploy finished. Check Vercel dashboard for your URL."
fi
