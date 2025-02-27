import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useCategorySelectQuery = () => {
  const fetchCategoryList = async () => {
    const response = await fetch('/api/cruds/ecommerce/categories/select');

    if (!response.ok) {
      toast.error(
        'Oops! Something didn’t go as planned. Please try again in a moment.',
        { position: 'top-center' },
      );
    }

    return response.json();
  };

  return useQuery({
    queryKey: ['ecommerce-category-select'],
    queryFn: fetchCategoryList,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });
};
