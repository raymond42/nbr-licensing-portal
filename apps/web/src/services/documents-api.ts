import type { ApplicationDocumentDto } from '@nbr/shared';
import type { DocumentType } from '@nbr/shared';

import { apiClient, getApiErrorMessage } from '@/lib/api-client';
import { getAccessToken } from '@/shared/utils/auth-storage';

export async function listDocuments(applicationId: string): Promise<ApplicationDocumentDto[]> {
  const { data } = await apiClient.get<ApplicationDocumentDto[]>(
    `/applications/${applicationId}/documents`,
  );
  return data;
}

export async function uploadDocument(params: {
  applicationId: string;
  file: File;
  type: DocumentType;
  logicalKey: string;
  expectedVersion: number;
  onProgress?: (pct: number) => void;
}): Promise<ApplicationDocumentDto> {
  const form = new FormData();
  form.append('file', params.file);
  form.append('type', params.type);
  form.append('logicalKey', params.logicalKey);
  form.append('expectedVersion', String(params.expectedVersion));

  const { data } = await apiClient.post<ApplicationDocumentDto>(
    `/applications/${params.applicationId}/documents`,
    form,
    {
      onUploadProgress: (evt) => {
        if (evt.total && params.onProgress) {
          params.onProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      },
    },
  );
  return data;
}

export async function downloadDocumentFile(
  applicationId: string,
  documentId: string,
): Promise<{ blob: Blob; fileName: string }> {
  const token = getAccessToken();
  const baseURL = apiClient.defaults.baseURL ?? '';
  const url = `${baseURL}/applications/${applicationId}/documents/${documentId}/file`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    throw new Error(`Download failed (${res.status})`);
  }
  const cd = res.headers.get('Content-Disposition');
  let fileName = 'download';
  const m = cd?.match(/filename\*=UTF-8''([^;]+)/);
  if (m?.[1]) {
    fileName = decodeURIComponent(m[1]);
  }
  const blob = await res.blob();
  return { blob, fileName };
}

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export function assertFileSize(file: File): void {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`File exceeds maximum size of ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB`);
  }
}

export { getApiErrorMessage };
