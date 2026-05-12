import { ApplicationStatus } from '../enums/application-status.enum';
import { DocumentType } from '../enums/document-type.enum';

export interface ApplicationDto {
  id: string;
  applicantId: string;
  institutionName: string;
  licenseCategory: string;
  description: string;
  status: ApplicationStatus;
  version: number;
  reviewCompletedByUserId: string | null;
  submittedAt: string | null;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationDto {
  institutionName: string;
  licenseCategory: string;
  description?: string;
}

export interface UpdateApplicationDto {
  institutionName?: string;
  licenseCategory?: string;
  description?: string;
}

export interface ApplicationDocumentDto {
  id: string;
  applicationId: string;
  type: DocumentType;
  logicalKey: string;
  version: number;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  checksum: string | null;
  uploadedByUserId: string;
  uploadedAt: string;
}
