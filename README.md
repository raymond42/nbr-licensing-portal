# NBR Licensing Portal

Regulatory workflow and compliance management platform used by the
**National Bank of Rwanda** to manage licensing applications for financial
institutions.

This repository is a pnpm-workspace monorepo containing two independently
deployable apps and a shared types package.

```text
nbr-licensing-portal/
├── apps/
│   ├── api/        # NestJS REST API
│   └── web/        # Next.js (App Router) frontend
├── packages/
│   └── shared/     # Type-only contracts (enums, DTOs, roles, workflow)
├── docs/           # Architecture, deployment, API reference
└── .github/        # CI/CD workflows
```

## Tech stack

| Layer    | Choice                                |
| -------- | ------------------------------------- |
| Backend  | NestJS, Prisma, PostgreSQL, JWT       |
| Frontend | Next.js (App Router), Tailwind, React Query, Axios |
| Shared   | TypeScript (strict), workspace package |
| DevOps   | Docker, docker-compose, GitHub Actions |

## Prerequisites

- **Node.js** ≥ 20 (see `.nvmrc`)
- **pnpm** ≥ 9 (`corepack enable`)
- **Docker** + **Docker Compose** (for the local Postgres / full-stack boot)

## Getting started

```bash
# 1. Install workspace dependencies
pnpm install

# 2. Configure environments (copy and edit)
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 3. Start Postgres (and optionally api/web) via Docker
docker compose up -d postgres

# 4. Build the shared package once so the apps can resolve it
pnpm --filter @nbr/shared build

# 5. Generate the Prisma client
pnpm --filter @nbr/api exec prisma generate

# 6. Apply database migrations (required so the schema matches the code)
pnpm --filter @nbr/api exec prisma migrate deploy

# 7. (Optional) Seed demo users and sample applications
pnpm seed

# 8. Run both apps in watch mode
pnpm dev
```

For first-time local development you can use `pnpm --filter @nbr/api exec prisma migrate dev` instead of `migrate deploy` if you prefer Prisma’s interactive migration workflow.

The web app will be available at <http://localhost:3000>; the API at
<http://localhost:3001/api> with Swagger UI at
<http://localhost:3001/api/docs> (OpenAPI JSON at `/api/docs-json`; `/docs` and `/docs-json` redirect here with 301). After seeding, use the demo accounts in
[`docs/api-reference.md`](docs/api-reference.md) to call `POST /api/auth/login`.

## Scripts

Run from the repository root:

| Command         | Description                                          |
| --------------- | ---------------------------------------------------- |
| `pnpm dev`      | Run all apps in watch mode in parallel.              |
| `pnpm build`    | Build `@nbr/shared`, then both apps.                 |
| `pnpm lint`     | Lint every workspace package.                        |
| `pnpm test`     | Run tests for every workspace package.               |
| `pnpm typecheck`| Strict type-check across the monorepo.               |
| `pnpm seed`     | Run the API Prisma seed via `pnpm --filter @nbr/api run seed` (demo users: `applicant@nbr.local`, `reviewer@nbr.local`, `approver@nbr.local`, `admin@nbr.local`; optional `SEED_DEFAULT_PASSWORD` in `apps/api/.env`; idempotent sample applications). |
| `pnpm format`   | Format the repository with Prettier.                 |

Per-app commands use pnpm filters, e.g.
`pnpm --filter @nbr/api dev` or `pnpm --filter @nbr/web build`.

## Docker / Compose

- `docker compose up -d postgres` — database only (recommended day-to-day).
- `docker compose up --build` — full stack (postgres + api + web).
- The `web` service is included for parity but most frontend devs run
  `pnpm --filter @nbr/web dev` directly for fast HMR.

## Project conventions

- **Strict TypeScript** everywhere (`strict: true`,
  `noUncheckedIndexedAccess: true`).
- **Feature-based folders** in both apps; no shared "utils" dumping ground.
- **Barrel exports** only where they aid the public surface (the shared
  package, component groups, etc.).
- **`@nbr/shared` is type-only** — never import runtime libs from it.
  See [`docs/architecture.md`](docs/architecture.md) for the full rule set.

## Independent deployment

The repository is structured so the two apps deploy on different cadences
to different hosts:

- Each app has its own `package.json`, `Dockerfile`, `.env.example`, and
  CI build job.
- No app imports source from the other; they meet only at the build-time
  contract (`@nbr/shared`) and the runtime REST contract.
- Frontend reaches the backend through `NEXT_PUBLIC_API_URL` — swap per
  environment with no code changes.

See [`docs/deployment.md`](docs/deployment.md) for full guidance.

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — system design, module map,
  shared-package usage rules, workflow and audit integrity.
- [`docs/deployment.md`](docs/deployment.md) — per-app deployment topology
  and independence checklist.
- [`docs/api-reference.md`](docs/api-reference.md) — REST endpoints, roles,
  workflow states (complement to Swagger at `/api/docs`).

## License

Internal — National Bank of Rwanda. All rights reserved.
