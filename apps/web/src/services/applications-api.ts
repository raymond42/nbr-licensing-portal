import type { ApplicationDto, CreateApplicationDto, PaginatedDto } from '@nbr/shared';

import { apiClient } from '@/lib/api-client';

export type UpdateApplicationBody = {
  expectedVersion: number;
  institutionName?: string;
  licenseCategory?: string;
  description?: string;
};

export type VersionedBody = { expectedVersion: number };
export type VersionedNoteBody = { expectedVersion: number; note?: string };

export async function listApplications(params?: {
  page?: number;
  take?: number;
}): Promise<PaginatedDto<ApplicationDto>> {
  const page = params?.page ?? 0;
  const take = params?.take ?? 20;
  const { data } = await apiClient.get<PaginatedDto<ApplicationDto>>('/applications', {
    params: { page, take },
  });
  return data;
}

export async function getApplication(id: string): Promise<ApplicationDto> {
  const { data } = await apiClient.get<ApplicationDto>(`/applications/${id}`);
  return data;
}

export async function createApplication(body: CreateApplicationDto): Promise<ApplicationDto> {
  const { data } = await apiClient.post<ApplicationDto>('/applications', body);
  return data;
}

export async function updateApplication(
  id: string,
  body: UpdateApplicationBody,
): Promise<ApplicationDto> {
  const { data } = await apiClient.patch<ApplicationDto>(`/applications/${id}`, body);
  return data;
}

export async function submitApplication(id: string, body: VersionedBody): Promise<ApplicationDto> {
  const { data } = await apiClient.post<ApplicationDto>(`/applications/${id}/submit`, body);
  return data;
}

export async function startReview(id: string, body: VersionedBody): Promise<ApplicationDto> {
  const { data } = await apiClient.post<ApplicationDto>(`/applications/${id}/start-review`, body);
  return data;
}

export async function continueReview(id: string, body: VersionedBody): Promise<ApplicationDto> {
  const { data } = await apiClient.post<ApplicationDto>(`/applications/${id}/continue-review`, body);
  return data;
}

export async function requestInfo(id: string, body: VersionedNoteBody): Promise<ApplicationDto> {
  const { data } = await apiClient.post<ApplicationDto>(`/applications/${id}/request-info`, body);
  return data;
}

export async function completeReview(id: string, body: VersionedNoteBody): Promise<ApplicationDto> {
  const { data } = await apiClient.post<ApplicationDto>(`/applications/${id}/complete-review`, body);
  return data;
}

export async function resubmitApplication(id: string, body: VersionedBody): Promise<ApplicationDto> {
  const { data } = await apiClient.post<ApplicationDto>(`/applications/${id}/resubmit`, body);
  return data;
}

export async function approveApplication(id: string, body: VersionedNoteBody): Promise<ApplicationDto> {
  const { data } = await apiClient.post<ApplicationDto>(`/applications/${id}/approve`, body);
  return data;
}

export async function rejectApplication(id: string, body: VersionedNoteBody): Promise<ApplicationDto> {
  const { data } = await apiClient.post<ApplicationDto>(`/applications/${id}/reject`, body);
  return data;
}
