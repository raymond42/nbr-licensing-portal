# API reference — NBR Licensing Portal (backend)

This document summarizes the **regulatory workflow** REST API. Authoritative
request/response schemas and “Try it out” live in **Swagger** at `/api/docs` on
the API host (e.g. `http://localhost:3001/api/docs` in development; spec at `/api/docs-json`). Legacy URLs `/docs` and `/docs-json` respond with **301** to the `/api/...` equivalents.

- **JSON base path**: `/api` (e.g. `http://localhost:3001/api/...`).
- **Authentication**: `POST /api/auth/login` returns a JWT. Send
  `Authorization: Bearer <token>` on protected routes.

## Auth and profile

| Method | Path | Description |
| ------ | ---- | ----------- |
| `POST` | `/api/auth/login` | Body: `email`, `password`. Returns `accessToken`, `expiresInSeconds`, `user`. |
| `GET`  | `/api/users/me`    | Current user profile (requires JWT). |
| `GET`  | `/api/users`       | List all users (`ADMIN` only). |

## Applications

All application routes below require JWT unless noted. **Mutating** workflow and
draft-update routes expect JSON body field **`expectedVersion`** (integer,
non-negative) for optimistic locking; mismatch returns **409 Conflict**.

| Method | Path | Roles (typical) | Description |
| ------ | ---- | --------------- | ----------- |
| `POST`   | `/api/applications` | `APPLICANT` | Create draft. Optional `description` (defaults to empty). |
| `GET`    | `/api/applications` | `APPLICANT`, `REVIEWER`, `APPROVER`, `ADMIN` | List (applicant: own; staff: non-draft queue policy; admin: all). |
| `GET`    | `/api/applications/:id` | Same | Get one (visibility rules apply). |
| `PATCH`  | `/api/applications/:id` | `APPLICANT` | `DRAFT`: `institutionName`, `licenseCategory`, `description`; `INFO_REQUESTED`: `description` only. Requires `expectedVersion`. |
| `POST`   | `/api/applications/:id/submit` | `APPLICANT` | `DRAFT` → `SUBMITTED`. |
| `POST`   | `/api/applications/:id/start-review` | `REVIEWER` | `SUBMITTED` → `UNDER_REVIEW`. |
| `POST`   | `/api/applications/:id/continue-review` | `REVIEWER` | `RESUBMITTED` → `UNDER_REVIEW`. |
| `POST`   | `/api/applications/:id/request-info` | `REVIEWER` | `UNDER_REVIEW` → `INFO_REQUESTED`. Body: `expectedVersion`, optional `note` (stored in audit metadata). |
| `POST`   | `/api/applications/:id/complete-review` | `REVIEWER` | `UNDER_REVIEW` → `REVIEW_COMPLETED`. Optional `note`. |
| `POST`   | `/api/applications/:id/resubmit` | `APPLICANT` | `INFO_REQUESTED` → `RESUBMITTED`. |
| `POST`   | `/api/applications/:id/approve` | `APPROVER` | `REVIEW_COMPLETED` → `APPROVED`. **403** if approver is the same user who completed review. Optional `note`. |
| `POST`   | `/api/applications/:id/reject` | `APPROVER` | `REVIEW_COMPLETED` → `REJECTED`. Optional `note`. |
| `POST`   | `/api/applications/:id/documents` | `APPLICANT` | Multipart: `file`, `type` (enum), `logicalKey`, `expectedVersion`. Max file size **5MB** (server-enforced). |
| `GET`    | `/api/applications/:id/documents` | `APPLICANT`, `REVIEWER`, `APPROVER`, `ADMIN` | List document metadata (no storage paths). |
| `GET`    | `/api/applications/:applicationId/documents/:documentId/file` | Same | Download file bytes (`Content-Disposition: attachment`). |

## Audit logs

| Method | Path | Description |
| ------ | ---- | ----------- |
| `GET` | `/api/audit-logs/:applicationId` | Chronological audit trail for an application (authorization follows application visibility). |

New audit rows include an **`integrityHash`** (SHA-256 of canonical fields) for tamper detection. Older rows may have `integrityHash: null`.

### Admin — global audit (`ADMIN` only)

| Method | Path | Description |
| ------ | ---- | ----------- |
| `GET` | `/api/admin/audit-logs?page=&take=` | Paginated global audit log (ordered by time, then id). |
| `POST` | `/api/admin/audit-logs/verify` | Recomputes hashes for all rows that have `integrityHash`; reports first mismatch if any. |

There are **no** update or delete endpoints for audit rows; immutability is
also enforced in PostgreSQL on `audit_logs`.

## Roles and access (summary)

| Role | Applications |
| ---- | ------------ |
| `APPLICANT` | Create and mutate **own** applications only; upload documents when status allows; cannot call reviewer or approver actions. |
| `REVIEWER` | Reviewer workflow actions only; **cannot** approve or reject. |
| `APPROVER` | Approve/reject only from `REVIEW_COMPLETED`; **cannot** perform reviewer actions. |
| `ADMIN` | Broad **read** access (e.g. list/get including drafts where policy allows); **no** workflow bypass — write routes use the same transition rules as other roles (admin is not granted on mutating application handlers). |

Wrong role → **403 Forbidden**. Illegal transition or terminal state → **400**
(with message). Version conflict → **409**.

## Workflow states and transitions

States: `DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `INFO_REQUESTED`, `RESUBMITTED`,
`REVIEW_COMPLETED`, `APPROVED`, `REJECTED`.

| From | To | Role |
| ---- | -- | ---- |
| `DRAFT` | `SUBMITTED` | `APPLICANT` |
| `SUBMITTED` | `UNDER_REVIEW` | `REVIEWER` |
| `UNDER_REVIEW` | `INFO_REQUESTED` | `REVIEWER` |
| `UNDER_REVIEW` | `REVIEW_COMPLETED` | `REVIEWER` |
| `INFO_REQUESTED` | `RESUBMITTED` | `APPLICANT` |
| `RESUBMITTED` | `UNDER_REVIEW` | `REVIEWER` |
| `REVIEW_COMPLETED` | `APPROVED` | `APPROVER` |
| `REVIEW_COMPLETED` | `REJECTED` | `APPROVER` |

Terminal: **`APPROVED`**, **`REJECTED`** (no further workflow changes).

Canonical list in code: [`packages/shared/src/workflow/workflow-state.const.ts`](../packages/shared/src/workflow/workflow-state.const.ts).

## Demo accounts (after `pnpm seed`)

| Email | Role |
| ----- | ---- |
| `applicant@nbr.local` | `APPLICANT` |
| `reviewer@nbr.local` | `REVIEWER` |
| `approver@nbr.local` | `APPROVER` |
| `admin@nbr.local` | `ADMIN` |

Default password is defined in [`apps/api/prisma/seed.ts`](../apps/api/prisma/seed.ts)
and can be overridden with **`SEED_DEFAULT_PASSWORD`** (min 12 characters when set).
Use only in secure local or bootstrap environments.
