-- AlterTable
ALTER TABLE "applications" ADD COLUMN "description" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN "integrityHash" TEXT;

CREATE INDEX "audit_logs_createdAt_id_idx" ON "audit_logs"("createdAt", "id");
