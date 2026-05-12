# Web app source layout

- **`app/`** — Next.js App Router routes only; pages stay thin and compose feature components.
- **`features/`** — Domain UI grouped by area (`applications`, `auth`, `layout`). Use **`features/<domain>/hooks/`** for hooks tied to that domain and **`features/<domain>/utils/`** for domain-specific helpers.
- **`services/`** — HTTP API clients (axios wrappers calling the Nest API).
- **`shared/`** — **`utils/`** (formatting, `cn`, auth storage, cross-cutting display helpers), **`api/`** (`api-client`, React Query keys/client factory). Prefer **`types/`** for web-only TypeScript types not yet in `@nbr/shared`.
- **`hooks/`** — Hooks shared across features (e.g. `use-auth.ts`).
- **`components/`** — Shared presentation (`ui/` for shadcn-style primitives, `states/` for empty/error patterns).
- **`providers/`** — React context providers.
- **`lib/`** — Thin re-exports for backwards-compatible imports (`@/lib/utils`, etc.); new code should import from `@/shared/*` or `@/features/*` directly.

Cross-package DTOs and enums live in **`@nbr/shared`**.
