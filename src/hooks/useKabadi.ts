import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export const useKabadiRates = () => {
  return useQuery({ queryKey: ['kabadi-rates'], queryFn: api.kabadi.getRates });
};

export const useScrapCategories = () => {
  return useQuery({
    queryKey: ['scrap-categories'],
    queryFn: api.kabadi.getCategories,
  });
};

export const useScrapItemDetails = (itemId: string) => {
  return useQuery({
    queryKey: ['scrap-item', itemId],
    queryFn: () => api.kabadi.getItemDetails(itemId),
    enabled: !!itemId,
  });
};
