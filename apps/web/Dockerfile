# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=20-alpine
ARG NEXT_PUBLIC_API_URL

FROM node:${NODE_VERSION} AS base
WORKDIR /workspace
RUN corepack enable

FROM base AS build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @nbr/shared build \
 && pnpm --filter @nbr/web build

FROM node:${NODE_VERSION} AS runtime
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /workspace
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

COPY --from=build --chown=nextjs:nextjs /workspace/apps/web/.next/standalone ./
COPY --from=build --chown=nextjs:nextjs /workspace/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=nextjs:nextjs /workspace/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000
WORKDIR /workspace/apps/web
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000)).then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
