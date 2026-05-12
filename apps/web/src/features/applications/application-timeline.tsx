import {
  FileUp,
  GitBranch,
  Info,
  Pencil,
  Send,
  UserCircle,
} from 'lucide-react';

import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineItem,
  TimelineMarker,
  TimelineTrack,
} from '@/components/ui/timeline';
import { EmptyState } from '@/components/states/empty-state';
import type { ApplicationAuditRow } from '@/services/audit-api';
import { formatRelativeTime } from '@/lib/format';
import { ApplicationStatus } from '@nbr/shared';

function metadataNote(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== 'object') return null;
  const note = (metadata as { note?: string }).note;
  return typeof note === 'string' && note.trim() ? note.trim() : null;
}

function transitionLabel(prev: string | null, next: string | null): string {
  if (!prev && next) return `→ ${next}`;
  if (prev && next) return `${prev} → ${next}`;
  if (prev && !next) return `${prev} → —`;
  return '—';
}

function iconForAction(action: string) {
  switch (action) {
    case 'DOCUMENT_UPLOADED':
      return FileUp;
    case 'STATUS_CHANGED':
      return GitBranch;
    case 'APPLICATION_UPDATED':
      return Pencil;
    case 'APPLICATION_CREATED':
      return Send;
    default:
      return UserCircle;
  }
}

export function ApplicationTimeline({ entries }: { entries: ApplicationAuditRow[] }) {
  const sorted = [...entries].reverse();

  if (sorted.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        description="Status changes, uploads, and updates will appear here."
      />
    );
  }

  return (
    <Timeline>
      {sorted.map((row, index) => {
        const Icon = iconForAction(row.action);
        const note = metadataNote(row.metadata);
        const isLast = index === sorted.length - 1;
        return (
          <TimelineItem key={row.id}>
            <TimelineTrack>
              <TimelineMarker>
                <Icon className="h-4 w-4" aria-hidden />
              </TimelineMarker>
              {!isLast ? <TimelineConnector /> : null}
            </TimelineTrack>
            <TimelineContent>
              <p className="text-sm text-foreground">
                <span className="font-medium">{row.actor.fullName}</span>
                <span className="text-muted-foreground"> ({row.actor.role.toLowerCase()})</span>
                {' · '}
                <span className="text-foreground/90">{humanizeAction(row)}</span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatRelativeTime(row.createdAt)} ·{' '}
                {transitionLabel(row.previousStatus, row.nextStatus)}
              </p>
              {note ? (
                <p className="mt-2 flex gap-2 rounded-md bg-muted/60 px-3 py-2 text-sm text-foreground">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span>{note}</span>
                </p>
              ) : null}
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
}

function humanizeAction(row: ApplicationAuditRow): string {
  switch (row.action) {
    case 'APPLICATION_CREATED':
      return 'created this application';
    case 'APPLICATION_UPDATED':
      return 'updated application details';
    case 'DOCUMENT_UPLOADED':
      return 'uploaded a supporting document';
    case 'STATUS_CHANGED':
      return humanizeStatusChange(row);
    default:
      return row.action.toLowerCase().replace(/_/g, ' ');
  }
}

function humanizeStatusChange(row: ApplicationAuditRow): string {
  const { previousStatus, nextStatus } = row;
  const note = metadataNote(row.metadata);

  if (nextStatus === ApplicationStatus.UNDER_REVIEW) {
    if (
      previousStatus === ApplicationStatus.SUBMITTED ||
      previousStatus === ApplicationStatus.RESUBMITTED
    ) {
      return 'picked up this case for review';
    }
  }
  if (nextStatus === ApplicationStatus.INFO_REQUESTED && previousStatus === ApplicationStatus.UNDER_REVIEW) {
    return 'requested more information from the applicant';
  }
  if (nextStatus === ApplicationStatus.REVIEW_COMPLETED && previousStatus === ApplicationStatus.UNDER_REVIEW) {
    if (note && /\b(reject|rejection|decline|deny|not\s*approve|do\s*not\s*approve)\b/i.test(note)) {
      return 'recommended rejecting (pending final decision)';
    }
    return 'recommended approving (pending final decision)';
  }
  if (nextStatus === ApplicationStatus.APPROVED && previousStatus === ApplicationStatus.REVIEW_COMPLETED) {
    return 'issued final approval';
  }
  if (nextStatus === ApplicationStatus.REJECTED && previousStatus === ApplicationStatus.REVIEW_COMPLETED) {
    return 'issued final rejection';
  }
  if (nextStatus === ApplicationStatus.SUBMITTED && previousStatus === ApplicationStatus.DRAFT) {
    return 'submitted the application for review';
  }
  if (nextStatus === ApplicationStatus.RESUBMITTED) {
    return 'resubmitted after information was requested';
  }
  return 'updated workflow status';
}
