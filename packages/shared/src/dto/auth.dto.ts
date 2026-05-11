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
}

export interface LoginResponseDto {
  accessToken: string;
  expiresInSeconds: number;
  user: AuthenticatedUserDto;
}
