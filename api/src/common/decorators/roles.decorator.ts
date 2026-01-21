import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../guards/role.guard.js';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
