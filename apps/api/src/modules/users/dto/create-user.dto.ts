import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@nbr/shared';
import { IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserBodyDto {
  @ApiProperty({ example: 'new.reviewer@nbr.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'New Reviewer' })
  @IsString()
  @MinLength(2)
  @MaxLength(256)
  fullName!: string;

  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role!: Role;

  @ApiProperty({ minLength: 12, description: 'Initial password for the account' })
  @IsString()
  @MinLength(12)
  @MaxLength(256)
  password!: string;
}
