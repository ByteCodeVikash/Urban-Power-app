import { 
  CATEGORIES, 
  TRENDING_SERVICES, 
  MOST_BOOKED_SERVICES, 
  RECOMMENDED_SERVICES, 
  OFFERS, 
  PAST_BOOKINGS, 
  SAVED_ADDRESSES,
  ALL_SERVICES,
  Category, 
  MinimalService, 
  Booking, 
  Address,
  DetailedService,
  REVIEWS,
  FAQS,
  PRODUCTS,
  KABADI_ITEMS
} from '../constants/MockData';

// Simulated Network delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  services: {
    getCategories: async (): Promise<Category[]> => {
      await delay(600);
      return CATEGORIES;
    },
    getTrending: async (): Promise<MinimalService[]> => {
      await delay(500);
      return TRENDING_SERVICES;
    },
    getMostBooked: async (): Promise<MinimalService[]> => {
      await delay(500);
      return MOST_BOOKED_SERVICES;
    },
    getRecommended: async (): Promise<MinimalService[]> => {
      await delay(500);
      return RECOMMENDED_SERVICES;
    },
    getOffers: async () => {
      await delay(400);
      return OFFERS;
    },
    getServiceDetails: async (serviceId: string): Promise<DetailedService> => {
      await delay(400);
      const service = ALL_SERVICES.find(s => s.id === serviceId)!;
      return {
        ...service,
        detailedReviews: REVIEWS,
        faqs: FAQS
      };
    }
  },
  user: {
    getBookings: async (): Promise<Booking[]> => {
      await delay(500);
      return PAST_BOOKINGS;
    },
    getAddresses: async (): Promise<Address[]> => {
      await delay(300);
      return SAVED_ADDRESSES;
    }
  },
  shop: {
    getProducts: async () => {
      await delay(600);
      return PRODUCTS;
    }
  },
  kabadi: {
    getRates: async () => {
      await delay(500);
      return KABADI_ITEMS;
    }
  }
};
