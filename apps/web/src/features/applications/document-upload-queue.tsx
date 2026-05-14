'use client';

import { DocumentType } from '@nbr/shared';
import { FileText, Trash2, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DOCUMENT_TYPE_OPTIONS } from '@/constants/document-types';
import { FileUpload } from '@/features/applications/file-upload';
import { getApiErrorMessage } from '@/lib/api-client';
import { formatBytes } from '@/lib/format';

type UploadStatus = 'queued' | 'uploading' | 'uploaded' | 'error';

interface QueuedDocument {
  id: string;
  file: File;
  type: DocumentType;
  logicalKey: string;
  progress: number | null;
  status: UploadStatus;
  error?: string;
}

export interface DocumentUploadItem {
  file: File;
  type: DocumentType;
  logicalKey: string;
}

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createHiddenLogicalKey(): string {
  return `document-${randomId()}`;
}

export function DocumentUploadQueue({
  id,
  disabled,
  defaultDocumentType = DocumentType.BUSINESS_PLAN,
  onUpload,
  onUploaded,
}: {
  id: string;
  disabled?: boolean;
  defaultDocumentType?: DocumentType;
  onUpload: (item: DocumentUploadItem, onProgress: (pct: number) => void) => Promise<void>;
  onUploaded?: () => Promise<void> | void;
}) {
  const [items, setItems] = useState<QueuedDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  function addFiles(files: File[]) {
    setItems((current) => [
      ...current,
      ...files.map((file) => ({
        id: randomId(),
        file,
        type: defaultDocumentType,
        logicalKey: createHiddenLogicalKey(),
        progress: null,
        status: 'queued' as const,
      })),
    ]);
  }

  function updateItem(idToUpdate: string, patch: Partial<QueuedDocument>) {
    setItems((current) =>
      current.map((item) => (item.id === idToUpdate ? { ...item, ...patch } : item)),
    );
  }

  function removeItem(idToRemove: string) {
    setItems((current) => current.filter((item) => item.id !== idToRemove));
  }

  async function uploadAll() {
    const uploadable = items.filter((item) => item.status !== 'uploaded');
    if (uploadable.length === 0) return;

    setIsUploading(true);
    let uploadedCount = 0;
    let failedCount = 0;

    for (const item of uploadable) {
      updateItem(item.id, { status: 'uploading', progress: 0, error: undefined });
      try {
        await onUpload(
          {
            file: item.file,
            type: item.type,
            logicalKey: item.logicalKey,
          },
          (pct) => updateItem(item.id, { progress: pct }),
        );
        uploadedCount += 1;
        updateItem(item.id, { status: 'uploaded', progress: 100 });
      } catch (err) {
        failedCount += 1;
        updateItem(item.id, {
          status: 'error',
          progress: null,
          error: getApiErrorMessage(err, 'Upload failed'),
        });
      }
    }

    if (uploadedCount > 0) {
      await onUploaded?.();
      toast.success(
        uploadedCount === 1 ? '1 document uploaded' : `${uploadedCount} documents uploaded`,
      );
    }
    if (failedCount > 0) {
      toast.error(
        failedCount === 1 ? '1 document failed to upload' : `${failedCount} documents failed to upload`,
      );
    }
    setItems((current) => current.filter((item) => item.status !== 'uploaded'));
    setIsUploading(false);
  }

  const hasUploadableFiles = items.some((item) => item.status !== 'uploaded');

  return (
    <div className="space-y-3">
      <FileUpload
        id={id}
        multiple
        disabled={disabled || isUploading}
        buttonLabel="Add documents"
        onFilesSelected={addFiles}
      />

      {items.length > 0 ? (
        <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">
              {items.length} selected document{items.length === 1 ? '' : 's'}
            </p>
            <Button
              type="button"
              variant="applicant"
              size="sm"
              disabled={disabled || isUploading || !hasUploadableFiles}
              onClick={() => void uploadAll()}
            >
              <UploadCloud className="h-4 w-4" aria-hidden />
              {isUploading ? 'Uploading...' : 'Upload all'}
            </Button>
          </div>

          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="rounded-lg border border-border bg-card p-3 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-start gap-2">
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{item.file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(item.file.size)}</p>
                      </div>
                    </div>
                    {item.status === 'uploading' && item.progress !== null ? (
                      <p className="mt-2 text-xs text-muted-foreground">Uploading... {item.progress}%</p>
                    ) : null}
                    {item.status === 'error' ? (
                      <p className="mt-2 text-xs text-destructive">{item.error}</p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Select
                      value={item.type}
                      disabled={isUploading}
                      onValueChange={(value) => updateItem(item.id, { type: value as DocumentType })}
                    >
                      <SelectTrigger className="w-full min-w-[220px] sm:w-[240px]">
                        <SelectValue placeholder="Document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isUploading}
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.file.name}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
