import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export const useMaintenanceCategories = () => {
  return useQuery({
    queryKey: ['maintenance-categories'],
    queryFn: api.maintenance.getCategories,
  });
};

export const useMaintenanceServices = (categoryId?: string) => {
  return useQuery({
    queryKey: ['maintenance-services', categoryId],
    queryFn: () => api.maintenance.getServices(categoryId),
  });
};
