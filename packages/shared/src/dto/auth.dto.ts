import { Role } from '../roles/role.enum';

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthenticatedUserDto {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  institutionName?: string | null;
  institutionCategory?: string | null;
}

export interface LoginResponseDto {
  accessToken: string;
  expiresInSeconds: number;
  user: AuthenticatedUserDto;
}

export interface RegisterApplicantRequestDto {
  fullName: string;
  email: string;
  password: string;
  institutionName: string;
  institutionCategory: string;
}

export interface RegisterApplicantResponseDto {
  id: string;
  email: string;
  fullName: string;
  institutionName?: string | null;
  institutionCategory?: string | null;
}
