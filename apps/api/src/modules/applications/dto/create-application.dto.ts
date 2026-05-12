import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateApplicationDto {
  @ApiPropertyOptional({ description: 'Defaults to empty string' })
  @IsOptional()
  @IsString()
  @MaxLength(20000)
  description?: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(256)
  institutionName!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(128)
  licenseCategory!: string;
}
