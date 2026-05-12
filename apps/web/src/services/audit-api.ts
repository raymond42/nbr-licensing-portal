import type { PaginatedDto } from '@nbr/shared';

import { apiClient } from '@/lib/api-client';

export interface AuditActor {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface ApplicationAuditRow {
  id: string;
  applicationId: string;
  actorUserId: string;
  action: string;
  previousStatus: string | null;
  nextStatus: string | null;
  metadata: unknown;
  integrityHash: string | null;
  createdAt: string;
  actor: AuditActor;
}

export async function listAuditForApplication(
  applicationId: string,
): Promise<ApplicationAuditRow[]> {
  const { data } = await apiClient.get<ApplicationAuditRow[]>(`/audit-logs/${applicationId}`);
  return data;
}

export interface AdminAuditRow extends ApplicationAuditRow {
  application: { id: string };
}

export async function listAdminAudit(
  page: number,
  take: number,
): Promise<PaginatedDto<AdminAuditRow>> {
  const { data } = await apiClient.get<PaginatedDto<AdminAuditRow>>('/admin/audit-logs', {
    params: { page, take },
  });
  return data;
}

export async function verifyAdminAudit(): Promise<{
  ok: boolean;
  checked: number;
  legacySkipped: number;
  brokenEntryId?: string;
}> {
  const { data } = await apiClient.post<{
    ok: boolean;
    checked: number;
    legacySkipped: number;
    brokenEntryId?: string;
  }>('/admin/audit-logs/verify');
  return data;
}
