import { ApplicationStatus } from '@nbr/shared';

import { cn } from '@/lib/utils';

const styles: Record<ApplicationStatus, string> = {
  [ApplicationStatus.DRAFT]: 'bg-gray-100 text-gray-800',
  [ApplicationStatus.SUBMITTED]: 'bg-sky-100 text-sky-900',
  [ApplicationStatus.UNDER_REVIEW]: 'bg-amber-100 text-amber-900',
  [ApplicationStatus.INFO_REQUESTED]: 'bg-violet-100 text-violet-900',
  [ApplicationStatus.RESUBMITTED]: 'bg-cyan-100 text-cyan-900',
  [ApplicationStatus.REVIEW_COMPLETED]: 'bg-emerald-100 text-emerald-900',
  [ApplicationStatus.APPROVED]: 'bg-green-600 text-white',
  [ApplicationStatus.REJECTED]: 'bg-red-100 text-red-900',
};

const stylesReviewReject: Partial<Record<ApplicationStatus, string>> = {
  [ApplicationStatus.REVIEW_COMPLETED]: 'bg-amber-100 text-amber-950 ring-1 ring-amber-200/80',
};

const labels: Record<ApplicationStatus, string> = {
  [ApplicationStatus.DRAFT]: 'Draft',
  [ApplicationStatus.SUBMITTED]: 'Submitted',
  [ApplicationStatus.UNDER_REVIEW]: 'Under review',
  [ApplicationStatus.INFO_REQUESTED]: 'Information requested',
  [ApplicationStatus.RESUBMITTED]: 'Resubmitted',
  [ApplicationStatus.REVIEW_COMPLETED]: 'Recommended: approve',
  [ApplicationStatus.APPROVED]: 'Approved',
  [ApplicationStatus.REJECTED]: 'Rejected',
};

export function StatusBadge({
  status,
  className,
  reviewCompletedAsReject,
}: {
  status: ApplicationStatus;
  className?: string;
  /** When status is REVIEW_COMPLETED and reviewer recommended rejection (same enum state). */
  reviewCompletedAsReject?: boolean;
}) {
  const isRejectRec =
    status === ApplicationStatus.REVIEW_COMPLETED && Boolean(reviewCompletedAsReject);
  const label =
    status === ApplicationStatus.REVIEW_COMPLETED && isRejectRec
      ? 'Recommended: reject'
      : labels[status];
  const style =
    isRejectRec && stylesReviewReject[ApplicationStatus.REVIEW_COMPLETED]
      ? stylesReviewReject[ApplicationStatus.REVIEW_COMPLETED]!
      : styles[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        style,
        className,
      )}
    >
      {label}
    </span>
  );
}
