# Deployment — NBR Licensing Portal

The two apps deploy independently. This document captures the recommended
target topology; concrete provider choices are environment decisions.

## API (`apps/api`)

- Build artifact: container image from `apps/api/Dockerfile`.
- Required env: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`,
  `CORS_ORIGIN`, `PORT`, `UPLOAD_DIR`, `MAX_UPLOAD_SIZE_BYTES`.
- **Container startup**: [`apps/api/docker-entrypoint.sh`](../apps/api/docker-entrypoint.sh)
  runs **`npx prisma migrate deploy`** before **`node dist/main.js`**, so the
  shipped image applies pending migrations on boot. Still verify migrations in
  CI/CD (logs, smoke tests) before promoting a release.
- **Uploads**: Default maximum request body size for documents is **5MB**
  (`MAX_UPLOAD_SIZE_BYTES=5242880`). Mount a **persistent volume** on
  `UPLOAD_DIR` in production (Compose already mounts `./apps/api/uploads` for
  local full-stack runs). Swap to object storage later if policy requires it.
- **Seed (optional)**: For non-production or dedicated bootstrap environments,
  you can run `pnpm --filter @nbr/api exec prisma db seed` with
  `SEED_DEFAULT_PASSWORD` set (minimum **12** characters when provided). The
  script is idempotent for demo users and only creates sample applications when
  none exist for the demo applicant. **Do not** rely on default passwords in
  production; use strong, environment-specific secrets.

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
