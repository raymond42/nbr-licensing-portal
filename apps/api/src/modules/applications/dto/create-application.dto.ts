import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateApplicationDto {
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
