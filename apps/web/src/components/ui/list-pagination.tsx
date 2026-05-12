'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ListPagination({
  page,
  take,
  total,
  onPageChange,
  className,
}: {
  page: number;
  take: number;
  total: number;
  onPageChange: (nextPage: number) => void;
  className?: string;
}) {
  const pageCount = Math.max(1, Math.ceil(total / take));
  const from = total === 0 ? 0 : page * take + 1;
  const to = Math.min(total, (page + 1) * take);
  const canPrev = page > 0;
  const canNext = (page + 1) * take < total;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-border bg-card/50 px-4 py-3 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{from}</span>–
        <span className="font-medium text-foreground">{to}</span> of{' '}
        <span className="font-medium text-foreground">{total}</span>
      </p>
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          disabled={!canPrev}
          aria-label="Previous page"
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </Button>
        <span className="min-w-[5.5rem] select-none text-center text-sm font-medium tabular-nums text-foreground">
          Page {page + 1} of {pageCount}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          disabled={!canNext}
          aria-label="Next page"
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
