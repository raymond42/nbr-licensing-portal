import type { CreateUserDto, PaginatedDto, UpdateUserDto, UserDto } from '@nbr/shared';

import { apiClient } from '@/lib/api-client';

export async function listUsers(params?: { page?: number; take?: number }): Promise<PaginatedDto<UserDto>> {
  const page = params?.page ?? 0;
  const take = params?.take ?? 10;
  const { data } = await apiClient.get<PaginatedDto<UserDto>>('/users', { params: { page, take } });
  return data;
}

export async function createUser(body: CreateUserDto): Promise<UserDto> {
  const { data } = await apiClient.post<UserDto>('/users', body);
  return data;
}

export async function updateUser(id: string, body: UpdateUserDto): Promise<UserDto> {
  const { data } = await apiClient.patch<UserDto>(`/users/${id}`, body);
  return data;
}
