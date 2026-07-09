import { API } from './backend';

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
  KABADI_ITEMS,
} from '../constants/MockData';

// Simulated Network delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // =========================
  // SERVICES
  // =========================
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
        faqs: FAQS,
      };
    },
  },

  // =========================
  // AUTH
  // =========================
  auth: {
    sendOtp: async (phone: string) => {
      const response = await API.post('/api/v1/auth/send-otp', {
        phone,
      });

      return response.data;
    },

    verifyOtp: async (phone: string, otp: string) => {
      const response = await API.post('/api/v1/auth/verify-otp', {
        phone,
        otp,
      });

      return response.data;
    },

    googleLogin: async (idToken: string) => {
      const response = await API.post('/api/v1/auth/google-login', {
        id_token: idToken,
      });

      return response.data;
    },

    login: async (phone: string, password: string) => {
      const response = await API.post('/api/v1/auth/login', {
        phone,
        password,
      });

      return response.data;
    },

    register: async (data: any) => {
      const response = await API.post('/api/v1/users/', data);

      return response.data;
    },

    deleteAccount: async (reason?: string): Promise<{ message: string }> => {
      const response = await API.delete('/api/v1/auth/account', {
        data: { confirm: true, reason },
      });
      return response.data;
    },
  },

  // =========================
  // USER
  // =========================
  user: {
    getBookings: async (): Promise<Booking[]> => {
      await delay(500);
      return PAST_BOOKINGS;
    },

    getAddresses: async (): Promise<Address[]> => {
      await delay(300);
      return SAVED_ADDRESSES;
    },
  },

  // =========================
  // SHOP
  // =========================
  shop: {
    getProducts: async () => {
      try {
        const response = await API.get('/api/products');

        return response.data.map((product: any) => ({
          id: String(product.id),
          title: product.name,
          price: product.price,
          image: product.imageUrl,
          category: product.categoryName,
          description: product.description,
        }));
      } catch (error) {
        console.error('Products API Error:', error);

        return [];
      }
    },

    getCategories: async () => {
      try {
        const response = await API.get('/api/product-categories');

        return response.data;
      } catch (error) {
        console.error('Product Categories API Error:', error);

        return [];
      }
    },
  },

  // =========================
  // REVIEWS
  // =========================
  reviews: {
    getReviews: async (serviceId: string) => {
      try {
        const response = await API.get(`/api/reviews/service/${serviceId}`);

        return response.data;
      } catch (error) {
        console.error('Reviews API Error:', error);

        return [];
      }
    },

    getTopServices: async () => {
      try {
        const response = await API.get('/api/reviews/top-services');

        return response.data;
      } catch (error) {
        console.error('Top Services API Error:', error);

        return [];
      }
    },
  },

  // =========================
  // KABADI
  // =========================
  kabadi: {
    getRates: async () => {
      try {
        const response = await API.get('/api/kabadi/rates');

        return response.data;
      } catch (error) {
        console.error('Kabadi API Error:', error);
        return [];
      }
    },
    getCategories: async () => {
      await delay(300);
      const mapped = KABADI_ITEMS.map(category => ({
        id: category.id,
        name: category.title,
        icon: 'file-text',
        image: category.icon,
        description: `${category.title} waste products and materials`,
        active: true,
        items: category.subcategories.map(sub => ({
          id: sub.id,
          category_id: category.id,
          name: sub.title,
          price_per_kg: sub.price,
          description: `Recycle your ${sub.title} at local market price.`,
          image: category.icon,
          active: true,
        })),
      }));
      return mapped;
    },
    getItemDetails: async (itemId: string) => {
      await delay(200);
      for (const category of KABADI_ITEMS) {
        const sub = category.subcategories.find(s => s.id === itemId);
        if (sub) {
          return {
            id: sub.id,
            category_id: category.id,
            name: sub.title,
            price_per_kg: sub.price,
            description: `Recycle your ${sub.title} at local market price.`,
            image: category.icon,
            active: true,
          };
        }
      }
      throw new Error('Scrap item not found');
    },
    createBooking: async (data: {
      address_text?: string;
      address_id?: string;
      booking_date: string;
      time_slot?: string;
      category_name?: string;
      item_name?: string;
      estimated_weight_kg?: number;
      estimated_value?: number;
      price_per_kg?: number;
      notes?: string;
      photos?: string[];
    }) => {
      const response = await API.post('/api/v1/scrap-bookings/', data);
      return response.data;
    },
    getMyBookings: async () => {
      const response = await API.get('/api/v1/scrap-bookings/me');
      return response.data;
    },
    getBookingDetails: async (bookingId: string) => {
      const response = await API.get(`/api/v1/scrap-bookings/${bookingId}`);
      return response.data;
    },
  },
  beautician: {
    getCategories: async () => {
      try {
        const response = await API.get('/api/v1/beautician/categories');
        return response.data;
      } catch (error) {
        console.error('Beautician Categories API Error:', error);
        return [];
      }
    },
    getServices: async (categoryId?: string) => {
      try {
        const url = categoryId
          ? `/api/v1/beautician/services?category_id=${categoryId}`
          : '/api/v1/beautician/services';
        const response = await API.get(url);
        return response.data;
      } catch (error) {
        console.error('Beautician Services API Error:', error);
        return [];
      }
    },
  },
  maintenance: {
    getCategories: async () => {
      try {
        const response = await API.get('/api/v1/maintenance/categories');
        return response.data;
      } catch (error) {
        console.error('Maintenance Categories API Error:', error);
        return [];
      }
    },
    getServices: async (categoryId?: string) => {
      try {
        const url = categoryId
          ? `/api/v1/maintenance/services?category_id=${categoryId}`
          : '/api/v1/maintenance/services';
        const response = await API.get(url);
        return response.data;
      } catch (error) {
        console.error('Maintenance Services API Error:', error);
        return [];
      }
    },
    createBooking: async (data: {
      address_text?: string;
      address_id?: string;
      booking_date: string;
      service_ids?: string[];
      service_names?: string[];
      total_price: number;
      notes?: string;
      photos?: string[];
      customer_name?: string;
      customer_phone?: string;
    }) => {
      const response = await API.post('/api/v1/maintenance-bookings/', data);
      return response.data;
    },
    getMyBookings: async () => {
      const response = await API.get('/api/v1/maintenance-bookings/me');
      return response.data;
    },
    getBookingDetails: async (bookingId: string) => {
      const response = await API.get(
        `/api/v1/maintenance-bookings/${bookingId}`,
      );
      return response.data;
    },
  },
  address: {
    getAddresses: async (userId?: number) => {
      const response = await API.get('/api/v1/addresses/');
      return response.data;
    },

    addAddress: async (data: any) => {
      const response = await API.post('/api/v1/addresses/', data);
      return response.data;
    },

    updateAddress: async (addressId: string, data: any) => {
      const response = await API.put(`/api/v1/addresses/${addressId}`, data);
      return response.data;
    },

    deleteAddress: async (addressId: string) => {
      const response = await API.delete(`/api/v1/addresses/${addressId}`);
      return response.data;
    },

    setDefaultAddress: async (addressId: string) => {
      const response = await API.put(`/api/v1/addresses/${addressId}`, {
        is_default: true,
      });
      return response.data;
    },
  },

  // =========================
  // CART
  // =========================
  cart: {
    getCart: async (userId: number) => {
      const response = await API.get(`/api/cart/${userId}`);

      return response.data;
    },

    addToCart: async (data: any) => {
      const response = await API.post('/api/cart/add', data);

      return response.data;
    },

    updateCart: async (data: any) => {
      const response = await API.put('/api/cart/update', data);

      return response.data;
    },

    removeFromCart: async (data: any) => {
      const response = await API.delete('/api/cart/remove', {
        data,
      });

      return response.data;
    },
  },

  // =========================
  // ORDERS
  // =========================
  orders: {
    placeOrder: async (data: any) => {
      const response = await API.post('/api/orders/place', data);

      return response.data;
    },

    getOrders: async (userId: number) => {
      const response = await API.get(`/api/orders/${userId}`);

      return response.data;
    },

    trackOrder: async (orderId: number) => {
      const response = await API.get(`/api/orders/track/${orderId}`);

      return response.data;
    },
  },

  // =========================
  // BOOKINGS
  // =========================
  bookings: {
    createBooking: async (data: any) => {
      const response = await API.post('/api/v1/bookings/', data);

      return response.data;
    },

    getBookingHistory: async (): Promise<any[]> => {
      const response = await API.get('/api/v1/bookings/history');
      return response.data;
    },

    getBookingDetails: async (bookingId: string): Promise<any> => {
      const response = await API.get(`/api/v1/bookings/${bookingId}`);
      return response.data;
    },

    getUserBookings: async (userId: number) => {
      const response = await API.get(`/api/bookings/user/${userId}`);

      return response.data;
    },

    getSlots: async () => {
      const response = await API.get('/api/bookings/slots');

      return response.data;
    },

    getAvailableDates: async (serviceId: string): Promise<string[]> => {
      try {
        const response = await API.get(
          `/api/v1/bookings/available-dates?service_id=${serviceId}`,
        );
        return response.data.available_dates;
      } catch (error) {
        console.error('getAvailableDates Error:', error);
        // Generate mock dates for the next 14 days, skipping Sundays (0)
        const dates: string[] = [];
        const today = new Date();
        for (let i = 0; i < 14; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          if (d.getDay() !== 0) {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            dates.push(`${year}-${month}-${day}`);
          }
        }
        return dates;
      }
    },

    getAvailableTimeslots: async (
      serviceId: string,
      date: string,
    ): Promise<
      { id: string; start_time: string; end_time: string; available: boolean }[]
    > => {
      try {
        const response = await API.get(
          `/api/v1/bookings/available-timeslots?service_id=${serviceId}&date=${date}`,
        );
        return response.data.available_timeslots;
      } catch (error) {
        console.error('getAvailableTimeslots Error:', error);
        // Fallback mock slots
        return [
          {
            id: '1',
            start_time: '09:00:00',
            end_time: '10:00:00',
            available: true,
          },
          {
            id: '2',
            start_time: '10:00:00',
            end_time: '11:00:00',
            available: true,
          },
          {
            id: '3',
            start_time: '11:00:00',
            end_time: '12:00:00',
            available: false,
          },
          {
            id: '4',
            start_time: '13:00:00',
            end_time: '14:00:00',
            available: true,
          },
          {
            id: '5',
            start_time: '14:00:00',
            end_time: '15:00:00',
            available: true,
          },
          {
            id: '6',
            start_time: '15:00:00',
            end_time: '16:00:00',
            available: false,
          },
          {
            id: '7',
            start_time: '16:00:00',
            end_time: '17:00:00',
            available: true,
          },
        ];
      }
    },
  },

  // =========================
  // MEDIA
  // =========================
  media: {
    upload: async (
      fileData: FormData,
      onUploadProgress?: (progressEvent: any) => void,
    ) => {
      const response = await API.post('/api/v1/media/upload', fileData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      });
      return response.data;
    },
  },

  // =========================
  // PAYMENTS
  // =========================
  payments: {
    createOrder: async (bookingId: string, amount: number) => {
      const response = await API.post('/api/v1/payments/create-order', {
        booking_id: bookingId,
        amount: amount,
      });
      return response.data as {
        order_id: string;
        amount: number;
        currency: string;
      };
    },
    verifyPayment: async (data: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }) => {
      const response = await API.post('/api/v1/payments/verify', data);
      return response.data;
    },
  },

  // =========================
  // ADMIN
  // =========================
  admin: {
    getDashboard: async () => {
      const response = await API.get('/api/v1/admin/orders/statistics');
      return response.data;
    },
    getOrders: async (params?: {
      page?: number;
      page_size?: number;
      booking_type?: string;
      status?: string;
      search?: string;
    }) => {
      const response = await API.get('/api/v1/admin/orders', { params });
      return response.data;
    },
  },
};
