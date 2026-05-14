export const queryKeys = {
  me: ['me'] as const,
  applications: (page: number, take: number, scope = 'default') =>
    ['applications', page, take, scope] as const,
  application: (id: string) => ['applications', id] as const,
  applicationDocuments: (id: string) => ['applications', id, 'documents'] as const,
  auditApplication: (id: string) => ['audit', 'application', id] as const,
  users: (page: number, take: number) => ['users', page, take] as const,
  adminAudit: (page: number, take: number) => ['admin', 'audit', page, take] as const,
};
