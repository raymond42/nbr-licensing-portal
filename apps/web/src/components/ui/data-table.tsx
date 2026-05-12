import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface Column<T> {
  key: string;
  header: ReactNode;
  className?: string;
  cell: (row: T) => ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  empty,
  getRowKey,
  variant = 'raised',
}: {
  columns: Column<T>[];
  rows: T[];
  empty?: ReactNode;
  getRowKey: (row: T) => string;
  /** Raised card matches regulator mockup tables */
  variant?: 'raised' | 'flat';
}) {
  if (rows.length === 0) {
    return empty ?? <p className="text-sm text-muted-foreground">No rows to display.</p>;
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card text-card-foreground',
        variant === 'raised' ? 'shadow-card' : 'shadow-sm dark:border-white/10',
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((c) => (
              <TableHead key={c.key} scope="col" className={c.className}>
                {c.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={getRowKey(row)}>
              {columns.map((c) => (
                <TableCell key={c.key} className={c.className}>
                  {c.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
