'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Info, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { type Column, DataTable } from '@/components/ui/data-table';
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton';
import { ListPagination } from '@/components/ui/list-pagination';
import { ErrorState } from '@/components/states/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { AUDIT_LIST_PAGE_SIZE } from '@/constants/pagination';
import { formatAdminAuditAction } from '@/lib/audit-display';
import { formatDateTime } from '@/lib/format';
import { getApiErrorMessage } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { AdminAuditRow } from '@/services/audit-api';
import { listAdminAudit, verifyAdminAudit } from '@/services/audit-api';

const VERIFY_TOOLTIP =
  'Recomputes integrity fingerprints for every audit row that stores a hash, in chronological order. Legacy rows without a hash are skipped but counted.';

export default function AdminAuditPage() {
  const [page, setPage] = useState(0);
  const take = AUDIT_LIST_PAGE_SIZE;

  const q = useQuery({
    queryKey: queryKeys.adminAudit(page, take),
    queryFn: () => listAdminAudit(page, take),
  });

  const verifyMut = useMutation({
    mutationFn: verifyAdminAudit,
    onSuccess: (res) => {
      if (res.ok) {
        toast.success(`Chain intact across ${res.checked} entries (${res.legacySkipped} legacy without hash)`);
      } else {
        toast.error(`Integrity failure at entry ${res.brokenEntryId ?? 'unknown'}`);
      }
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  if (q.isError) {
    return <ErrorState message={getApiErrorMessage(q.error)} onRetry={() => void q.refetch()} />;
  }

  const rows = q.data?.items ?? [];
  const total = q.data?.total ?? 0;

  const columns: Column<AdminAuditRow>[] = [
    {
      key: 'when',
      header: 'When',
      cell: (r) => <span className="whitespace-nowrap text-foreground">{formatDateTime(r.createdAt)}</span>,
    },
    {
      key: 'actor',
      header: 'Actor',
      cell: (r) => (
        <span className="text-foreground">
          {r.actor.email} <span className="text-muted-foreground">({r.actor.role.toLowerCase()})</span>
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      cell: (r) => (
        <code className="text-xs text-foreground">{formatAdminAuditAction(r.action)}</code>
      ),
    },
    {
      key: 'app',
      header: 'App',
      cell: (r) => (
        <span className="font-mono text-xs text-muted-foreground">{r.application?.id ?? '—'}</span>
      ),
    },
    {
      key: 'transition',
      header: 'Before → After',
      cell: (r) => (
        <span className="text-xs text-foreground">
          {r.previousStatus ?? '—'} → {r.nextStatus ?? '—'}
        </span>
      ),
    },
    {
      key: 'hash',
      header: 'Hash',
      cell: (r) => (
        <span className="font-mono text-xs text-muted-foreground">
          {r.integrityHash ? `${r.integrityHash.slice(0, 12)}…` : '—'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Audit log"
        subtitle="Append-only · tamper-evident"
        actions={
          <span className="inline-flex items-center gap-2" title={VERIFY_TOOLTIP}>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={verifyMut.isPending}
              onClick={() => verifyMut.mutate()}
            >
              <Info className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              Verify chain
            </Button>
          </span>
        }
      />

      {!q.isPending && verifyMut.isSuccess && verifyMut.data.ok ? (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          <ShieldCheck className="h-5 w-5 flex-shrink-0" aria-hidden />
          Chain intact across {verifyMut.data.checked} entries ({verifyMut.data.legacySkipped} legacy without hash
          skipped).
        </div>
      ) : null}

      {q.isPending ? (
        <DataTableSkeleton rows={8} columns={6} />
      ) : (
        <DataTable columns={columns} rows={rows} getRowKey={(r) => r.id} />
      )}
      {!q.isPending ? (
        <ListPagination className="mt-4" page={page} take={take} total={total} onPageChange={setPage} />
      ) : null}
    </div>
  );
}
