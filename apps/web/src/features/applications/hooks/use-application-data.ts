'use client';

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/query-keys';
import * as applicationsApi from '@/services/applications-api';
import { listAuditForApplication } from '@/services/audit-api';
import { listDocuments } from '@/services/documents-api';

export function useApplicationDataBundle(applicationId: string) {
  const appQ = useQuery({
    queryKey: queryKeys.application(applicationId),
    queryFn: () => applicationsApi.getApplication(applicationId),
  });
  const docsQ = useQuery({
    queryKey: queryKeys.applicationDocuments(applicationId),
    queryFn: () => listDocuments(applicationId),
  });
  const auditQ = useQuery({
    queryKey: queryKeys.auditApplication(applicationId),
    queryFn: () => listAuditForApplication(applicationId),
  });
  return { appQ, docsQ, auditQ };
}
