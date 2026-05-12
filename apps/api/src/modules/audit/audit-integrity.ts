import { createHash } from 'crypto';

import type { Prisma } from '@prisma/client';
import { AuditAction, ApplicationStatus } from '@prisma/client';

export function stableMetadataString(metadata: Prisma.InputJsonValue | undefined): string {
  if (metadata === undefined || metadata === null) {
    return '';
  }
  return JSON.stringify(sortJson(metadata));
}

function sortJson(value: Prisma.InputJsonValue): unknown {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return value;
  }
  const obj = value as Record<string, Prisma.InputJsonValue>;
  const sortedKeys = Object.keys(obj).sort();
  const out: Record<string, unknown> = {};
  for (const k of sortedKeys) {
    out[k] = sortJson(obj[k] as Prisma.InputJsonValue);
  }
  return out;
}

export function computeAuditIntegrityHash(params: {
  id: string;
  applicationId: string;
  actorUserId: string;
  action: AuditAction;
  previousStatus: ApplicationStatus | null;
  nextStatus: ApplicationStatus | null;
  metadata?: Prisma.InputJsonValue;
}): string {
  const meta = stableMetadataString(params.metadata);
  const payload = [
    params.id,
    params.applicationId,
    params.actorUserId,
    params.action,
    params.previousStatus ?? '',
    params.nextStatus ?? '',
    meta,
  ].join('|');
  return createHash('sha256').update(payload, 'utf8').digest('hex');
}
