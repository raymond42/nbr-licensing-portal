# Deployment — NBR Licensing Portal

The two apps deploy independently. This document captures the recommended
target topology; concrete provider choices are environment decisions.

## API (`apps/api`)

- Build artifact: container image from `apps/api/Dockerfile`.
- Required env: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`,
  `CORS_ORIGIN`, `PORT`, `UPLOAD_DIR`, `MAX_UPLOAD_SIZE_BYTES`.
- Run database migrations on each release:
  `pnpm --filter @nbr/api prisma migrate deploy`.
- Persistent storage: mount a volume for `UPLOAD_DIR` (or swap to S3-style
  object storage in `documents` once implemented).

## Web (`apps/web`)

- Recommended target: a managed Next.js platform (Vercel-style). The
  Dockerfile is provided for self-hosted scenarios.
- Required env at **build time**: `NEXT_PUBLIC_API_URL`,
  `NEXT_PUBLIC_APP_NAME` (because `NEXT_PUBLIC_*` is inlined at build).
- Each environment (dev / staging / production) is a separate build keyed
  on its own API URL.

## Database

- PostgreSQL 16+. Provision with a managed service in production.
- Local dev uses the `postgres` service in `docker-compose.yml`.

## CI/CD

- `ci.yml` runs lint, test, and per-app build on every PR.
- `deploy.yml` is a placeholder dispatched manually per app — wire to your
  hosting provider when chosen.

## Independence checklist

- [x] Separate `package.json`, `Dockerfile`, `.env.example` per app.
- [x] No cross-app source imports — only `@nbr/shared` (types).
- [x] FE talks to BE via env-driven base URL.
- [x] Per-app CI build jobs.
- [x] Compose used for local only.
