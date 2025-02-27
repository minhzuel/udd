import { $Enums } from '@prisma/client';
import { SystemSetting } from './system';

// Enums
export const UserStatus = $Enums.UserStatus;
export type UserStatus = $Enums.UserStatus;

// Models
export interface User {
  id: string;
  email: string;
  password?: string | null;
  country?: string | null;
  timezone?: string | null;
  name?: string | null;
  roleId: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastSignInAt?: Date | null;
  emailVerifiedAt?: Date | null;
  isTrashed: boolean;
  avatar?: string | null;
  invitedByUserId?: string | null;
  isProtected: boolean;
  role: UserRole;
}

export interface UserRole {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  isTrashed: boolean;
  createdByUserId?: string | null;
  createdAt: Date;
  isProtected: boolean;
  isDefault: boolean;
  createdByUser?: User | null;
  users?: User[];
  permissions?: UserRolePermission[];
  settings?: SystemSetting[];
}

export interface UserPermission {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  createdByUserId?: string | null;
  createdAt: Date;
  createdByUser?: User | null;
  roles?: UserRolePermission[];
}

export interface UserRolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  assignedAt: Date;
  role?: UserRole;
  permission?: UserPermission;
}

export interface UserAddress {
  id: string;
  userId: string;
  addressLine: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  user?: User;
}
