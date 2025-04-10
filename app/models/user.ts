import { $Enums } from '@prisma/client';

// Enums
export const UserStatus = $Enums.UserStatus;
export type UserStatus = $Enums.UserStatus;

// Models
export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  password?: string | null;
  avatar?: string | null;
  roleId: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  emailVerifiedAt?: Date | null;
  lastSignInAt?: Date | null;
  role: UserRole;
  isTrashed: boolean;
}

export interface UserRole {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  isDefault: boolean;
  isProtected: boolean;
  createdAt: Date;
  users?: User[];
  permissions?: UserPermission[];
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
