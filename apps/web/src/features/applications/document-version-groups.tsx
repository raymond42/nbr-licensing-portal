'use client';

import { Download } from 'lucide-react';

import { EmptyState } from '@/components/states/empty-state';
import { Button } from '@/components/ui/button';
import { formatBytes, formatDateTime } from '@/lib/format';
import { groupDocumentsByLogicalKey } from '@/lib/document-groups';
import type { ApplicationDocumentDto } from '@nbr/shared';

export function DocumentVersionGroups({
  documents,
  onDownload,
}: {
  documents: ApplicationDocumentDto[];
  onDownload: (documentId: string) => void;
}) {
  const groups = groupDocumentsByLogicalKey(documents);
  if (groups.length === 0) {
    return (
      <EmptyState
        title="No documents yet"
        description="Upload supporting files from this page when uploads are enabled for your application."
      />
    );
  }

  return (
    <ul className="space-y-5">
      {groups.map((g) => (
        <li
          key={g.logicalKey}
          className="rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-3 shadow-sm"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100/80 pb-2">
            <span className="text-sm font-semibold text-gray-900">{g.logicalKey}</span>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {g.versions.length} version{g.versions.length === 1 ? '' : 's'}
            </span>
          </div>
          <ul className="divide-y divide-gray-100">
            {g.versions.map((d, index) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-gray-800">{d.originalFileName}</span>
                    {index === 0 ? (
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-900">
                        Current
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">v{d.version}</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {formatBytes(d.sizeBytes)} · {formatDateTime(d.uploadedAt)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-shrink-0 px-2"
                  onClick={() => onDownload(d.id)}
                >
                  <Download className="h-4 w-4" aria-label={`Download ${d.originalFileName}`} />
                </Button>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
