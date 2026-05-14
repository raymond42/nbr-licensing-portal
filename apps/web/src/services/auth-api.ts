import type {
  AuthenticatedUserDto,
  LoginRequestDto,
  LoginResponseDto,
  RegisterApplicantRequestDto,
  RegisterApplicantResponseDto,
} from '@nbr/shared';

import { apiClient } from '@/lib/api-client';

export interface CurrentUserProfileDto extends AuthenticatedUserDto {
  createdAt?: string;
  institutionName?: string | null;
  institutionCategory?: string | null;
}

export async function login(body: LoginRequestDto): Promise<LoginResponseDto> {
  const { data } = await apiClient.post<LoginResponseDto>('/auth/login', body);
  return data;
}

export async function register(body: RegisterApplicantRequestDto): Promise<RegisterApplicantResponseDto> {
  const { data } = await apiClient.post<RegisterApplicantResponseDto>('/auth/register', body);
  return data;
}

export async function fetchMe(): Promise<CurrentUserProfileDto> {
  const { data } = await apiClient.get<CurrentUserProfileDto>('/users/me');
  return data;
}
