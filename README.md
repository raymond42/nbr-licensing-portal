# NBR Licensing Portal

Demonstration regulatory workflow for licensing-style applications. This project is a technical assessment and portfolio piece. It is not an official product of the National Bank of Rwanda, any government institution, or any regulator.

## 1. Project Overview

The application models a simplified licensing workflow where applicants create and submit applications, reviewers request information or complete reviews, approvers make final decisions, and admins can observe non-draft work.

The repository is built as a pnpm workspace with independently deployable frontend and backend apps:

```text
nbr-licensing-portal/
├── apps/
│   ├── api/        NestJS REST API, Prisma, PostgreSQL, JWT
│   └── web/        Next.js App Router frontend
├── packages/
│   └── shared/     Shared DTOs, enums, roles, workflow constants
├── docs/           Architecture and API notes
└── .github/        CI and deployment workflow placeholders
```

Primary local URLs:

- Web: `http://localhost:3000`
- API: `http://localhost:3001/api`
- API health: `http://localhost:3001/api/health`
- Platform health probe: `http://localhost:3001/health`
- Swagger UI: `http://localhost:3001/api/docs`

## 2. Architecture Overview

The frontend and backend communicate only through the REST API. Shared compile-time contracts live in `@nbr/shared`; neither app imports source from the other app.

The main services are:

- `apps/web`: Next.js, React, Tailwind, Mantine, React Query, Axios.
- `apps/api`: NestJS, Prisma, PostgreSQL, JWT authentication, Swagger, Joi environment validation.
- `packages/shared`: shared TypeScript contracts and workflow constants.
- `postgres`: local Docker Compose database; production should use Neon PostgreSQL, Railway PostgreSQL, or an equivalent managed PostgreSQL service.

The intended production-style deployment topology is:

- Vercel hosts `apps/web`.
- Railway or Render hosts `apps/api`.
- Neon PostgreSQL or Railway PostgreSQL hosts the database.
- GitHub Actions runs lint, tests, type checks, and independent builds.

## 3. Local Setup

Requirements:

- Node.js 20 or newer.
- pnpm 9 or newer.
- Docker and Docker Compose for the local database or full local stack.

Install dependencies and prepare environment files:

```bash
corepack enable
pnpm install

cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Run with a host Node process and Dockerized Postgres:

```bash
docker compose up -d postgres
pnpm --filter @nbr/shared build
pnpm --filter @nbr/api exec prisma generate
pnpm --filter @nbr/api exec prisma migrate dev
pnpm seed
pnpm dev
```

Useful root scripts:

- `pnpm dev`: run workspace dev scripts.
- `pnpm build`: build shared package and both apps.
- `pnpm lint`: run lint across workspaces.
- `pnpm test`: run workspace tests.
- `pnpm typecheck`: run TypeScript checks.
- `pnpm seed`: seed local/demo users and applications.

## 4. Docker Setup

For the full local stack with hot reload:

```bash
docker compose up --build
```

This starts:

- `postgres` on host port `5432` with a persistent named volume.
- `api` on host port `3001` using `apps/api/Dockerfile.dev` and Nest watch mode.
- `web` on host port `3000` using `apps/web/Dockerfile.dev` and Next dev mode.

The Compose setup bind-mounts the repository source and uses named volumes for container `node_modules`, so host dependencies and container dependencies do not overwrite each other.

For database-only local development:

```bash
docker compose up -d postgres
```

Production Dockerfiles are provided for both apps:

- `apps/api/Dockerfile`: Debian-based image compatible with Prisma engines, frozen lockfile install, Prisma generate/build, non-root runtime, `/api/health` healthcheck.
- `apps/web/Dockerfile`: Next standalone build image with a non-root runtime and root-page healthcheck.

When building the web image outside Vercel, pass the public API URL at build time:

```bash
docker build -f apps/web/Dockerfile --build-arg NEXT_PUBLIC_API_URL=https://<api-host>/api .
```

## 5. Environment Variables

Root `.env` is for Docker Compose defaults only:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `POSTGRES_PORT`
- `JWT_SECRET`

Backend variables in `apps/api/.env`:

- `NODE_ENV`: `development`, `test`, or `production`.
- `PORT`: API port, defaults to `3001`.
- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: required signing secret, at least 16 characters.
- `JWT_EXPIRES_IN`: token lifetime, for example `3600s`.
- `FRONTEND_URL`: deployed frontend origin, for example `https://<web-host>`.
- `CORS_ORIGIN`: optional comma-separated allowed origins, useful for Vercel previews or local variants.
- `UPLOAD_DIR`: upload storage directory.
- `MAX_UPLOAD_SIZE_BYTES`: upload size limit.
- `SEED_DEFAULT_PASSWORD`: optional seed password override for local/demo data.

Frontend variables in `apps/web/.env`:

- `NEXT_PUBLIC_API_URL`: public URL of the Nest API, including `/api`.

Production examples:

```bash
NEXT_PUBLIC_API_URL=https://<api-host>/api
FRONTEND_URL=https://<web-host>
CORS_ORIGIN=https://<web-host>,https://<preview-host>
DATABASE_URL=postgresql://user:password@host:5432/db?sslmode=require
```

## 6. Running Migrations

Local development migration workflow:

```bash
pnpm --filter @nbr/api exec prisma migrate dev
```

Production or release workflow:

```bash
pnpm --filter @nbr/api exec prisma migrate deploy
```

Migrations are stored in `apps/api/prisma/migrations` and should be committed. In production, run `migrate deploy` once per release before or during the backend deployment. Avoid running migrations concurrently across multiple replicas.

The API Docker entrypoint runs `prisma migrate deploy` by default. Set `RUN_MIGRATIONS=false` on hosts where migrations are handled by a separate release command.

## 7. Running Seeds

Seed local/demo users and sample applications with:

```bash
pnpm seed
```

The seed script lives at `apps/api/prisma/seed.ts`. It is intended for local or controlled demo environments. Do not run demo seeding automatically against production data unless that is an explicit release decision.

Demo users include:

- `applicant@nbr.local`
- `reviewer@nbr.local`
- `approver@nbr.local`
- `admin@nbr.local`

If `SEED_DEFAULT_PASSWORD` is not set, the seed uses a documented local-only default. Set a strong `SEED_DEFAULT_PASSWORD` for any shared demo environment.

## 8. Frontend Deployment

Vercel is the primary target for the Next.js app.

Recommended Vercel settings:

- Project root: `apps/web`, or repo root with filtered pnpm commands.
- Install command: `pnpm install --frozen-lockfile`.
- Build command from repo root: `pnpm --filter @nbr/shared build && pnpm --filter @nbr/web build`.
- Output: Vercel auto-detects Next.js.
- Environment: `NEXT_PUBLIC_API_URL=https://<api-host>/api`.

`apps/web/next.config.mjs` keeps `transpilePackages: ['@nbr/shared']` and `output: 'standalone'` so the app can also be smoke-tested in a container when needed.

All frontend API calls should go through `apps/web/src/shared/api/api-client.ts`. Production builds require `NEXT_PUBLIC_API_URL`; local development falls back to `http://localhost:3001/api`.

## 9. Backend Deployment

Railway or Render are suitable targets for the NestJS API.

Backend build/start commands for a Node service:

```bash
pnpm install --frozen-lockfile
pnpm --filter @nbr/shared build
pnpm --filter @nbr/api exec prisma generate
pnpm --filter @nbr/api build
pnpm --filter @nbr/api start:prod
```

Backend environment:

- Set `DATABASE_URL` from Neon PostgreSQL, Railway PostgreSQL, or another managed PostgreSQL provider.
- Set `JWT_SECRET` to a strong secret.
- Set `FRONTEND_URL` to the deployed Vercel origin.
- Set `CORS_ORIGIN` only when you need more than one allowed origin.
- Set `PORT` only if the host does not inject one automatically.

Health checks:

- Preferred application health route: `/api/health`.
- Platform-friendly fallback route: `/health`.

If deploying with the API Dockerfile, use `apps/api/Dockerfile`. The entrypoint runs Prisma migrations unless `RUN_MIGRATIONS=false`.

## 10. Production Considerations

Use managed infrastructure for production-style deployments:

- Vercel for the frontend.
- Railway or Render for the backend.
- Neon PostgreSQL or Railway PostgreSQL for the database.

Security and operations checklist:

- Never commit `.env` files or real secrets.
- Use `pnpm install --frozen-lockfile` in CI and production builds.
- Keep `DATABASE_URL` encrypted in host or GitHub secrets.
- Use SSL parameters required by the database provider, commonly `?sslmode=require`.
- Run Prisma migrations once per release, not concurrently per replica.
- Treat file uploads as local/demo storage unless a persistent object store is added.
- Configure `FRONTEND_URL` and `CORS_ORIGIN` explicitly for deployed environments.
- Keep `JWT_SECRET` long, random, and environment-specific.
- Review Swagger exposure before production use.
- Use CI checks before deployment: lint, tests, typecheck, API build, and web build.

Additional docs:

- `docs/architecture.md`
- `docs/deployment.md`
- `docs/api-reference.md`

Disclaimer: this software is submitted for assessment purposes only. It is not affiliated with, endorsed by, or representative of the National Bank of Rwanda, NBR, or any regulator. Names, branding, and workflows are illustrative unless otherwise stated by the author.
