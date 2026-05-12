import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { DocumentType } from '@prisma/client';
import { Allow, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { VersionedMutationDto } from './versioned.dto';

export class UploadDocumentBodyDto extends VersionedMutationDto {
  /** Multipart may include `file` on the parsed body; binary is read from `@UploadedFile()`. */
  @ApiHideProperty()
  @Allow()
  @IsOptional()
  file?: unknown;

  @ApiProperty({ enum: DocumentType })
  @IsEnum(DocumentType)
  type!: DocumentType;

  @ApiProperty({
    description: 'Stable key for versioning (e.g. same key increments version on re-upload)',
    example: 'CERTIFICATE_OF_INCORPORATION',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  logicalKey!: string;
}
