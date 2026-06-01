import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export const useKabadiRates = () => {
  return useQuery({ queryKey: ['kabadi-rates'], queryFn: api.kabadi.getRates });
};
