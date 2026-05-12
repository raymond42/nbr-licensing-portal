import { ApplicationStatus } from '@nbr/shared';

import type { ApplicationAuditRow } from '@/services/audit-api';

export interface ActorLine {
  id: string;
  label: string;
}

function actorLabel(actor: ApplicationAuditRow['actor']): string {
  return `${actor.fullName} (${actor.email})`;
}

function noteFromMetadata(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== 'object') return null;
  const note = (metadata as { note?: string }).note;
  return typeof note === 'string' && note.trim() ? note.trim() : null;
}

export function findReviewerActor(audit: ApplicationAuditRow[]): ActorLine | null {
  const chronological = [...audit].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  for (const row of chronological) {
    if (row.action !== 'STATUS_CHANGED') continue;
    if (row.nextStatus !== ApplicationStatus.UNDER_REVIEW) continue;
    if (
      row.previousStatus === ApplicationStatus.SUBMITTED ||
      row.previousStatus === ApplicationStatus.RESUBMITTED
    ) {
      return { id: row.actorUserId, label: actorLabel(row.actor) };
    }
  }
  return null;
}

export function findRecommenderActor(
  audit: ApplicationAuditRow[],
  reviewCompletedByUserId: string | null,
): ActorLine | null {
  if (!reviewCompletedByUserId) return null;
  const chronological = [...audit].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const row = [...chronological]
    .reverse()
    .find(
      (r) =>
        r.action === 'STATUS_CHANGED' &&
        r.nextStatus === ApplicationStatus.REVIEW_COMPLETED &&
        r.actorUserId === reviewCompletedByUserId,
    );
  if (row) {
    return { id: row.actorUserId, label: actorLabel(row.actor) };
  }
  return { id: reviewCompletedByUserId, label: reviewCompletedByUserId };
}

export function findApproverActor(audit: ApplicationAuditRow[]): ActorLine | null {
  const chronological = [...audit].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  for (let i = chronological.length - 1; i >= 0; i -= 1) {
    const row = chronological[i]!;
    if (row.action !== 'STATUS_CHANGED') continue;
    if (
      row.nextStatus === ApplicationStatus.APPROVED ||
      row.nextStatus === ApplicationStatus.REJECTED
    ) {
      return { id: row.actorUserId, label: actorLabel(row.actor) };
    }
  }
  return null;
}

export function inferRecommendRejectFromAudit(audit: ApplicationAuditRow[]): boolean {
  const chronological = [...audit].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  for (let i = chronological.length - 1; i >= 0; i -= 1) {
    const row = chronological[i]!;
    if (
      row.action === 'STATUS_CHANGED' &&
      row.nextStatus === ApplicationStatus.REVIEW_COMPLETED
    ) {
      const note = noteFromMetadata(row.metadata);
      if (!note) return false;
      return /\b(reject|rejection|decline|deny|not\s*approve|do\s*not\s*approve)\b/i.test(note);
    }
  }
  return false;
}
