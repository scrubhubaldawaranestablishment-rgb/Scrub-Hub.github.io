FROM node:20-alpine AS base
WORKDIR /app

# Build from monorepo root (Railway root directory must be empty / repo root)
COPY package.json package-lock.json ./
COPY packages/database/package.json ./packages/database/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
RUN npm ci --workspace=@creatorpilot/api --workspace=@creatorpilot/database --include-workspace-root

COPY packages/database ./packages/database
COPY apps/api ./apps/api

RUN npm run db:generate
RUN npm run build --workspace=@creatorpilot/database
RUN npm run build --workspace=@creatorpilot/api

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/packages/database ./packages/database
COPY --from=base /app/apps/api/dist ./apps/api/dist
COPY --from=base /app/apps/api/package.json ./apps/api/package.json
COPY scripts/start-api.sh ./scripts/start-api.sh
RUN chmod +x ./scripts/start-api.sh

EXPOSE 4000
CMD ["./scripts/start-api.sh"]
