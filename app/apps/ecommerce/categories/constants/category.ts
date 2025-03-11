import { EcommerceCategoryStatus } from '@/app/models/ecommerce';

// Default status mapping
export const CategoryStatusProps = {
  [EcommerceCategoryStatus.ACTIVE]: {
    label: 'Active',
    variant: 'success',
  },
  [EcommerceCategoryStatus.INACTIVE]: {
    label: 'Inactive',
    variant: 'warning',
  },
};

// Function to get status properties
export const getCategoryStatusProps = (status: EcommerceCategoryStatus) => {
  return (
    CategoryStatusProps[status] || { label: 'Unknown', variant: 'success' }
  );
};
