import { DocumentType } from '@nbr/shared';

export const DOCUMENT_TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: DocumentType.CERTIFICATE_OF_INCORPORATION, label: 'Certificate of incorporation' },
  { value: DocumentType.ARTICLES_OF_ASSOCIATION, label: 'Articles of association' },
  { value: DocumentType.AUDITED_FINANCIAL_STATEMENTS, label: 'Audited financial statements' },
  { value: DocumentType.BUSINESS_PLAN, label: 'Business plan' },
  { value: DocumentType.TAX_CLEARANCE, label: 'Tax clearance' },
  { value: DocumentType.DIRECTOR_IDENTIFICATION, label: 'Director identification' },
  { value: DocumentType.OTHER, label: 'Other' },
];

export function documentTypeLabel(type: DocumentType): string {
  return DOCUMENT_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}
