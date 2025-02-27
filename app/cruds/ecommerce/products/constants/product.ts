import { EcommerceProductStatus } from '@/app/models/ecommerce';

// Default status mapping
export const ProductStatusProps = {
  [EcommerceProductStatus.PUBLISHED]: {
    label: 'Published',
    variant: 'success',
  },
  [EcommerceProductStatus.INACTIVE]: {
    label: 'Inactive',
    variant: 'warning',
  },
};

// Function to get status properties
export const getProductStatusProps = (status: EcommerceProductStatus) => {
  return ProductStatusProps[status] || { label: 'Unknown', variant: 'success' };
};
