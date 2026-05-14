# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=20-bookworm-slim

FROM node:${NODE_VERSION} AS base
WORKDIR /workspace
RUN corepack enable \
 && apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

FROM base AS build
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @nbr/shared build \
 && pnpm --filter @nbr/api exec prisma generate \
 && pnpm --filter @nbr/api build

FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3001
WORKDIR /workspace/apps/api

COPY --from=build /workspace/node_modules /workspace/node_modules
COPY --from=build /workspace/apps/api/node_modules /workspace/apps/api/node_modules
COPY --from=build /workspace/apps/api/dist /workspace/apps/api/dist
COPY --from=build /workspace/apps/api/package.json /workspace/apps/api/package.json
COPY --from=build /workspace/apps/api/prisma /workspace/apps/api/prisma
COPY --from=build /workspace/apps/api/docker-entrypoint.sh /workspace/apps/api/docker-entrypoint.sh
COPY --from=build /workspace/packages/shared/package.json /workspace/packages/shared/package.json
COPY --from=build /workspace/packages/shared/dist /workspace/packages/shared/dist

RUN chmod +x /workspace/apps/api/docker-entrypoint.sh \
 && mkdir -p /workspace/apps/api/uploads \
 && chown -R node:node /workspace/apps/api/uploads

USER node

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3001) + '/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT ["/workspace/apps/api/docker-entrypoint.sh"]
