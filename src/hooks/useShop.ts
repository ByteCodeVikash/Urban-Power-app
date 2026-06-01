import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export const useProducts = () => {
  return useQuery({ queryKey: ['products'], queryFn: api.shop.getProducts });
};
