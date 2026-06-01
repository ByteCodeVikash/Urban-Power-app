import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export const useCategories = () => {
  return useQuery({ queryKey: ['categories'], queryFn: api.services.getCategories });
};

export const useTrendingServices = () => {
  return useQuery({ queryKey: ['trending'], queryFn: api.services.getTrending });
};

export const useMostBooked = () => {
  return useQuery({ queryKey: ['most-booked'], queryFn: api.services.getMostBooked });
};

export const useRecommended = () => {
  return useQuery({ queryKey: ['recommended'], queryFn: api.services.getRecommended });
};

export const useOffers = () => {
  return useQuery({ queryKey: ['offers'], queryFn: api.services.getOffers });
};

export const useServiceDetails = (serviceId: string) => {
  return useQuery({ 
      queryKey: ['serviceDetails', serviceId], 
      queryFn: () => api.services.getServiceDetails(serviceId) 
  });
};

export const useBookings = () => {
  return useQuery({ queryKey: ['bookings'], queryFn: api.user.getBookings });
}

export const useAddresses = () => {
  return useQuery({ queryKey: ['addresses'], queryFn: api.user.getAddresses });
}
