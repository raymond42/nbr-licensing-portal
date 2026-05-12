import type {
  AuthenticatedUserDto,
  LoginRequestDto,
  LoginResponseDto,
  RegisterApplicantRequestDto,
  RegisterApplicantResponseDto,
} from '@nbr/shared';

import { apiClient } from '@/lib/api-client';

export async function login(body: LoginRequestDto): Promise<LoginResponseDto> {
  const { data } = await apiClient.post<LoginResponseDto>('/auth/login', body);
  return data;
}

export async function register(body: RegisterApplicantRequestDto): Promise<RegisterApplicantResponseDto> {
  const { data } = await apiClient.post<RegisterApplicantResponseDto>('/auth/register', body);
  return data;
}

export async function fetchMe(): Promise<AuthenticatedUserDto> {
  const { data } = await apiClient.get<AuthenticatedUserDto>('/users/me');
  return data;
}
