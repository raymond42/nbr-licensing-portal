'use client';

import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { assertFileSize, MAX_UPLOAD_BYTES } from '@/services/documents-api';

export function FileUpload({
  id,
  disabled,
  multiple = false,
  buttonLabel = 'Add file',
  onFilesSelected,
}: {
  id: string;
  disabled?: boolean;
  multiple?: boolean;
  buttonLabel?: string;
  onFilesSelected: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;
    try {
      files.forEach(assertFileSize);
      onFilesSelected(files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid file');
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        multiple={multiple}
        className="sr-only"
        disabled={disabled}
        onChange={onChange}
      />
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4" aria-hidden />
        {buttonLabel}
      </Button>
      <p className="mt-1 text-xs text-gray-500">Max {MAX_UPLOAD_BYTES / (1024 * 1024)} MB per file.</p>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
