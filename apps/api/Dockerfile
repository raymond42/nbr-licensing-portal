# syntax=docker/dockerfile:1.7
# bookworm-slim: Prisma engines expect glibc + OpenSSL compatible libs (Alpine musl often breaks libssl resolution).
ARG NODE_VERSION=20-bookworm-slim

FROM node:${NODE_VERSION} AS deps
WORKDIR /workspace
RUN corepack enable
COPY pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile=false

FROM node:${NODE_VERSION} AS build
WORKDIR /workspace
RUN corepack enable
COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=deps /workspace/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /workspace/packages/shared/node_modules ./packages/shared/node_modules
COPY . .
RUN pnpm --filter @nbr/shared build \
 && pnpm --filter @nbr/api exec prisma generate \
 && pnpm --filter @nbr/api build

FROM node:${NODE_VERSION} AS runtime
ENV NODE_ENV=production
WORKDIR /workspace/apps/api
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
RUN corepack enable

COPY --from=build /workspace/node_modules /workspace/node_modules
COPY --from=build /workspace/apps/api/node_modules /workspace/apps/api/node_modules
COPY --from=build /workspace/apps/api/dist /workspace/apps/api/dist
COPY --from=build /workspace/apps/api/package.json /workspace/apps/api/package.json
COPY --from=build /workspace/apps/api/prisma /workspace/apps/api/prisma
COPY --from=build /workspace/packages/shared/package.json /workspace/packages/shared/package.json
COPY --from=build /workspace/packages/shared/dist /workspace/packages/shared/dist

EXPOSE 3001
CMD ["node", "dist/main.js"]
