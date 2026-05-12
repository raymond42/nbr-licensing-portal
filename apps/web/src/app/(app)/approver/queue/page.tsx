'use client';

import { ApplicationStatus } from '@nbr/shared';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { type Column, DataTable } from '@/components/ui/data-table';
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton';
import { TableViewAction } from '@/components/ui/table-view-action';
import { ListPagination } from '@/components/ui/list-pagination';
import { EmptyState } from '@/components/states/empty-state';
import { ErrorState } from '@/components/states/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { APPLICATION_LIST_PAGE_SIZE } from '@/constants/pagination';
import { formatDateTime } from '@/lib/format';
import { getApiErrorMessage } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { ApplicationDto } from '@nbr/shared';
import * as applicationsApi from '@/services/applications-api';

export default function ApproverQueuePage() {
  const [page, setPage] = useState(0);
  const take = APPLICATION_LIST_PAGE_SIZE;

  const q = useQuery({
    queryKey: queryKeys.applications(page, take),
    queryFn: () => applicationsApi.listApplications({ page, take }),
  });

  if (q.isError) {
    return <ErrorState message={getApiErrorMessage(q.error)} onRetry={() => void q.refetch()} />;
  }

  const rows = q.data?.items ?? [];
  const total = q.data?.total ?? 0;

  const columns: Column<ApplicationDto>[] = [
    {
      key: 'institution',
      header: 'Institution',
      cell: (r) => <span className="font-medium text-foreground">{r.institutionName}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      cell: (r) => <span className="text-muted-foreground">{r.licenseCategory}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (r) => <StatusBadge status={r.status as ApplicationStatus} />,
    },
    {
      key: 'updated',
      header: 'Updated',
      cell: (r) => <span className="text-muted-foreground">{formatDateTime(r.updatedAt)}</span>,
    },
    {
      key: 'actions',
      header: <span className="sr-only">View</span>,
      className: 'w-14 text-center',
      cell: (r) => <TableViewAction href={`/approver/applications/${r.id}`} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Review queue"
        subtitle="Applications awaiting final decision."
      />
      {q.isPending ? (
        <DataTableSkeleton rows={8} columns={5} />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={(r) => r.id}
          empty={<EmptyState title="No applications awaiting approval" />}
        />
      )}
      {!q.isPending ? (
        <ListPagination className="mt-4" page={page} take={take} total={total} onPageChange={setPage} />
      ) : null}
    </div>
  );
}
