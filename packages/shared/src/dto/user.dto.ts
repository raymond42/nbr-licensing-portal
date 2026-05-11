import { Role } from '../roles/role.enum';

export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  fullName: string;
  role: Role;
  password: string;
}

export interface UpdateUserDto {
  fullName?: string;
  role?: Role;
  isActive?: boolean;
}
