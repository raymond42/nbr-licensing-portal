import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function DataTableSkeleton({
  rows = 7,
  columns = 5,
  variant = 'raised',
}: {
  rows?: number;
  columns?: number;
  variant?: 'raised' | 'flat';
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card text-card-foreground',
        variant === 'raised' ? 'shadow-card' : 'shadow-sm',
      )}
      aria-busy
      aria-label="Loading table"
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-20" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, ri) => (
            <TableRow key={ri}>
              {Array.from({ length: columns }).map((_, ci) => (
                <TableCell key={ci}>
                  <Skeleton
                    className={cn(
                      'h-4 max-w-[180px]',
                      ci === 0 ? 'w-[min(100%,12rem)]' : ci === columns - 1 ? 'w-8 mx-auto' : 'w-[min(100%,8rem)]',
                    )}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function CardContentSkeleton({ lines = 3 }: { lines?: number }) {
  const widths = ['w-[88%]', 'w-[55%]', 'w-[72%]', 'w-[64%]'] as const;
  return (
    <div className="space-y-2 py-0.5" aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-4', widths[i % widths.length])} />
      ))}
    </div>
  );
}
