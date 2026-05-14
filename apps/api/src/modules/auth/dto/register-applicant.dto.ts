import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterApplicantDto {
  @ApiProperty({ example: 'Jane Applicant' })
  @IsString()
  @MinLength(2)
  @MaxLength(256)
  fullName!: string;

  @ApiProperty({ example: 'Kigali Community Microfinance' })
  @IsString()
  @MinLength(2)
  @MaxLength(256)
  institutionName!: string;

  @ApiProperty({ example: 'Microfinance' })
  @IsString()
  @MinLength(2)
  @MaxLength(128)
  institutionCategory!: string;

  @ApiProperty({ example: 'new.applicant@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8, description: 'Password (min 8 characters)' })
  @IsString()
  @MinLength(8)
  @MaxLength(256)
  password!: string;
}
