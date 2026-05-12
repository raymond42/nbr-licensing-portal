export function formatAdminAuditAction(action: string): string {
  switch (action) {
    case 'APPLICATION_CREATED':
      return 'create_application';
    case 'APPLICATION_UPDATED':
      return 'update_application';
    case 'DOCUMENT_UPLOADED':
      return 'upload_document';
    case 'STATUS_CHANGED':
      return 'status_changed';
    default:
      return action.toLowerCase();
  }
}
