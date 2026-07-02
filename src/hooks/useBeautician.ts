import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export const useBeauticianCategories = () => {
  return useQuery({
    queryKey: ['beautician-categories'],
    queryFn: api.beautician.getCategories,
  });
};

export const useBeauticianServices = (categoryId?: string) => {
  return useQuery({
    queryKey: ['beautician-services', categoryId],
    queryFn: () => api.beautician.getServices(categoryId),
  });
};
