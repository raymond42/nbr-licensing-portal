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

---

## LocatorJS (click-to-source in dev)

- **Use `pnpm dev`** (`next dev`) on **`http://localhost:3000`**. Locator does **not** work with production React (`next start`, Vercel prod, etc.).
- This app uses **`@locator/webpack-loader`** ([`next.config.mjs`](../next.config.mjs)) scoped with explicit **`include`** paths to `apps/web/src` and `packages/shared/src` so Locator instruments your code (not arbitrary `node_modules`).
- Use the **LocatorJS browser extension** for the runtime UI. The embedded `@locator/runtime` package is intentionally not loaded because it currently conflicts with this app's Next/Solid dependency graph.
- **Babel / JSX `__source`:** Locator’s docs suggest `@babel/plugin-transform-react-jsx-source` when SWC omits metadata. Adding a root `babel.config.js` **disables Next’s SWC-as-Babel shortcut** for the whole app and, in this repo, **breaks `next build`** (modern deps in `node_modules`, e.g. TanStack Query, use class private fields/methods that need a larger Babel matrix). We therefore **do not** commit a global Babel config; rely on the webpack-loader + clear **`.next`** after config changes.
- **Upstream:** Locator + **Next 14 App Router** still has rough edges ([e.g. GitHub issues](https://github.com/infi-pc/locatorjs/issues)); if you still see “No source info”, use **React DevTools → Components** or editor **Go to definition** as a fallback.
- **`@locator/webpack-loader` version:** npm registry latest is **0.5.1** (already pinned). Run `pnpm update @locator/webpack-loader` periodically.
- After changing Locator/webpack config, delete **`.next`** and restart dev.


**Disclaimer:** This web app is part of a technical assessment and is **not** affiliated with or endorsed by the National Bank of Rwanda (NBR) or any official regulator.
