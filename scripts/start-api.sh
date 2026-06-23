#!/bin/sh
set -e

echo "Running database migrations..."
cd packages/database && npx prisma db push --skip-generate
cd /app

echo "Starting CreatorPilot API..."
cd apps/api && node dist/main.js
