# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=20-alpine

FROM node:${NODE_VERSION} AS runtime
WORKDIR /workspace
RUN corepack enable

COPY pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile=false

COPY . .
RUN pnpm --filter @nbr/shared build \
 && pnpm --filter @nbr/web build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
WORKDIR /workspace/apps/web
CMD ["pnpm", "start"]
