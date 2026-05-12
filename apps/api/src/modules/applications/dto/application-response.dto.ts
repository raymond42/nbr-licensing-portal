import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';

export class ApplicationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  applicantId!: string;

  @ApiProperty()
  institutionName!: string;

  @ApiProperty()
  licenseCategory!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty({ enum: ApplicationStatus })
  status!: ApplicationStatus;

  @ApiProperty()
  version!: number;

  @ApiPropertyOptional({ nullable: true })
  reviewCompletedByUserId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  submittedAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  decidedAt!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
