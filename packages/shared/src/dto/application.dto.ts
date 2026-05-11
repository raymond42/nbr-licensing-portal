import { ApplicationStatus } from '../enums/application-status.enum';
import { DocumentType } from '../enums/document-type.enum';

export interface ApplicationDto {
  id: string;
  applicantId: string;
  institutionName: string;
  licenseCategory: string;
  status: ApplicationStatus;
  submittedAt: string | null;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationDto {
  institutionName: string;
  licenseCategory: string;
}

export interface UpdateApplicationDto {
  institutionName?: string;
  licenseCategory?: string;
}

export interface ApplicationDocumentDto {
  id: string;
  applicationId: string;
  type: DocumentType;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}
