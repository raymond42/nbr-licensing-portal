import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from '@prisma/client';

export class ApplicationDocumentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  applicationId!: string;

  @ApiProperty({ enum: DocumentType })
  type!: DocumentType;

  @ApiProperty()
  logicalKey!: string;

  @ApiProperty()
  version!: number;

  @ApiProperty()
  originalFileName!: string;

  @ApiProperty()
  mimeType!: string;

  @ApiProperty()
  sizeBytes!: number;

  @ApiPropertyOptional({ nullable: true })
  checksum!: string | null;

  @ApiProperty()
  uploadedByUserId!: string;

  @ApiProperty()
  uploadedAt!: string;
}
