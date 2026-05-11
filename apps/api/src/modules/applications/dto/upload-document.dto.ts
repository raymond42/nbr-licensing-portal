import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from '@prisma/client';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';

import { VersionedMutationDto } from './versioned.dto';

export class UploadDocumentBodyDto extends VersionedMutationDto {
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
