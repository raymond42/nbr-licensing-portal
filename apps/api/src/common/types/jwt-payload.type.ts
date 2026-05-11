import type { Role } from '@nbr/shared';

export interface RequestUser {
  sub: string;
  email: string;
  role: Role;
}
