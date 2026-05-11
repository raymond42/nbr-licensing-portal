# Architecture — NBR Licensing Portal

## Overview

The portal is a two-service system inside a single repository:

- **`apps/api`** — NestJS REST API, owns the database via Prisma.
- **`apps/web`** — Next.js (App Router) frontend, consumes the API over HTTPS.
- **`packages/shared`** — type-only contracts shared between the two.

The two apps are **co-located** for developer ergonomics but **independently
deployable**. They communicate strictly via the REST API, so they can live on
different hosts, scale independently, and ship on different cadences.

## Why a monorepo

- Single source of truth for cross-app contracts (`@nbr/shared`).
- Atomic PRs that update API + Web together (e.g. when a DTO changes).
- Unified tooling (TypeScript, ESLint, Prettier, CI).

## Why independent deployments

- Each app has its own `package.json`, `Dockerfile`, env contract, and CI
  build job.
- No app imports source from the other; they only meet at:
  - the **build-time contract** (`@nbr/shared`)
  - the **runtime contract** (REST over `NEXT_PUBLIC_API_URL`)
- Compose is for local dev only. Production targets a managed/dedicated host
  per app, with no refactor needed.

## The `@nbr/shared` package — usage rules

Treat `@nbr/shared` as a **contract layer**, not a utility library:

1. Export only `type`, `interface`, `enum`, and primitive `const`.
2. Never import Node-only modules (`fs`, `path`, `crypto`), browser-only
   modules (`window`, `document`), framework-only code (Nest decorators,
   React), or heavy third-party libs (axios, etc.) from this package.
3. Keep `sideEffects: false` so both runtimes can tree-shake aggressively.
4. Treat it as **append-mostly**: changing an existing exported shape is a
   coordinated change touching API + Web in the same PR.
5. Validation classes (`class-validator`) belong in the API; the wire shape
   they validate against lives here as plain interfaces.

Doing all of this means a runtime regression in one app can never reach the
other through the shared package.

## Data flow

```mermaid
flowchart LR
  Browser -->|"HTTPS / JSON"| Web[Next.js (apps/web)]
  Web -->|"REST via NEXT_PUBLIC_API_URL"| API[NestJS (apps/api)]
  API --> DB[(PostgreSQL)]
  API -.uses.-> Shared[("@nbr/shared (types only)")]
  Web -.uses.-> Shared
```

## Module map (API)

| Module         | Responsibility                                        |
| -------------- | ----------------------------------------------------- |
| `auth`         | Authentication, JWT issuance, strategy registration.  |
| `users`        | User management and role assignment.                  |
| `applications` | Licensing application CRUD and lookups.               |
| `workflow`     | Authoritative state machine for application lifecycle.|
| `audit`        | Append-only audit trail for regulatory traceability.  |
| `documents`    | Document upload, storage, retrieval.                  |
| `common`       | Cross-cutting helpers (filters, interceptors, DTOs).  |

## Future considerations

- Add a `packages/api-client` later if a generated typed client becomes
  preferable to hand-rolled axios calls.
- Promote `audit` to its own service if compliance requirements demand
  storage isolation.
