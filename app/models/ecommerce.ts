import { $Enums } from '@prisma/client';
import { User } from './user';

// Enums
export const EcommerceCategoryStatus = $Enums.EcommerceCategoryStatus;
export type EcommerceCategoryStatus = $Enums.EcommerceCategoryStatus;

export const EcommerceProductStatus = $Enums.EcommerceProductStatus;
export type EcommerceProductStatus = $Enums.EcommerceProductStatus;

// Models
export interface EcommerceCategory {
  id: string;
  name: string;
  description?: string | null;
  slug: string;
  isTrashed: boolean;
  status: EcommerceCategoryStatus;
  parentId?: string | null;
  parent?: EcommerceCategory | null;
  children?: EcommerceCategory[];
  products?: EcommerceProduct[];
  createdAt: Date;
  createdByUserId?: string | null;
  createdByUser?: User | null;
}

export interface EcommerceProduct {
  id: string;
  name: string;
  sku?: string | null;
  description?: string | null;
  price: number;
  beforeDiscount?: number | null;
  isTrashed: boolean;
  status: EcommerceProductStatus;
  stockValue: number;
  createdAt: Date;
  categoryId?: string | null;
  category?: EcommerceCategory | null;
  thumbnail?: string | null;
  images?: EcommerceProductImage[];
}

export interface EcommerceProductImage {
  id: string;
  productId: string;
  url: string;
  product?: EcommerceProduct;
}
