#!/bin/bash
# Railway API service configuration reference
# Run this after connecting your GitHub repo to Railway.

cat <<'EOF'
╔══════════════════════════════════════════════════════════════╗
║           CreatorPilot AI — Railway API Setup                ║
╚══════════════════════════════════════════════════════════════╝

IMPORTANT: Do NOT set Root Directory to apps/web (that is for Vercel).

In Railway → your API service → Settings:

  1. SOURCE
     Root Directory: (leave EMPTY — use repo root)

  2. BUILD
     Builder: Dockerfile
     Dockerfile path: Dockerfile

  3. DATABASES (same project)
     + New → PostgreSQL → link DATABASE_URL to API service
     + New → Redis → link REDIS_URL to API service

  4. VARIABLES (API service)
     JWT_SECRET=<run: openssl rand -hex 32>
     CORS_ORIGIN=https://your-app.vercel.app

  5. NETWORKING
     Generate Domain → copy URL for Vercel API_PROXY_TARGET

  6. REDEPLOY
     Deployments → Redeploy latest from main branch

Verify: https://YOUR-RAILWAY-DOMAIN/api/health
Expected: {"status":"ok","service":"creatorpilot-api"}

EOF
