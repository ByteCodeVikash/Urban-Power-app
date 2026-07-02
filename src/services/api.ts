import { API } from "./backend";

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
} from "../constants/MockData";

// Simulated Network delay helper
const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

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

    getServiceDetails: async (
      serviceId: string
    ): Promise<DetailedService> => {
      await delay(400);

      const service = ALL_SERVICES.find(
        (s) => s.id === serviceId
      )!;

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
      const response = await API.post("/api/auth/send-otp", {
        phone,
      });

      return response.data;
    },

    verifyOtp: async (phone: string, otp: string) => {
      const response = await API.post("/api/auth/verify-otp", {
        phone,
        otp,
      });

      return response.data;
    },

    login: async (phone: string, password: string) => {
      const response = await API.post("/api/auth/login", {
        phone,
        password,
      });

      return response.data;
    },

    register: async (data: any) => {
      const response = await API.post(
        "/api/auth/register",
        data
      );

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
        const response = await API.get("/api/products");

        return response.data.map((product: any) => ({
          id: String(product.id),
          title: product.name,
          price: product.price,
          image: product.imageUrl,
          category: product.categoryName,
          description: product.description,
        }));
      } catch (error) {
        console.error(
          "Products API Error:",
          error
        );

        return [];
      }
    },

    getCategories: async () => {
      try {
        const response = await API.get(
          "/api/product-categories"
        );

        return response.data;
      } catch (error) {
        console.error(
          "Product Categories API Error:",
          error
        );

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
        const response = await API.get(
          `/api/reviews/service/${serviceId}`
        );

        return response.data;
      } catch (error) {
        console.error(
          "Reviews API Error:",
          error
        );

        return [];
      }
    },

    getTopServices: async () => {
      try {
        const response = await API.get(
          "/api/reviews/top-services"
        );

        return response.data;
      } catch (error) {
        console.error(
          "Top Services API Error:",
          error
        );

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
      const response = await API.get("/api/kabadi/rates");

      return response.data;
    } catch (error) {
      console.error("Kabadi API Error:", error);
      return [];
    }
  },
},
  // =========================
  // ADDRESS
  // =========================
  address: {
    getAddresses: async (userId: number) => {
      const response = await API.get(
        `/api/address/user/${userId}`
      );

      return response.data;
    },

    addAddress: async (data: any) => {
      const response = await API.post(
        "/api/address/add",
        data
      );

      return response.data;
    },

    deleteAddress: async (
      addressId: number
    ) => {
      const response = await API.delete(
        `/api/address/delete/${addressId}`
      );

      return response.data;
    },

    setDefaultAddress: async (
      addressId: number
    ) => {
      const response = await API.put(
        `/api/address/default/${addressId}`
      );

      return response.data;
    },
  },

  // =========================
  // CART
  // =========================
  cart: {
    getCart: async (userId: number) => {
      const response = await API.get(
        `/api/cart/${userId}`
      );

      return response.data;
    },

    addToCart: async (data: any) => {
      const response = await API.post(
        "/api/cart/add",
        data
      );

      return response.data;
    },

    updateCart: async (data: any) => {
      const response = await API.put(
        "/api/cart/update",
        data
      );

      return response.data;
    },

    removeFromCart: async (data: any) => {
      const response = await API.delete(
        "/api/cart/remove",
        {
          data,
        }
      );

      return response.data;
    },
  },

  // =========================
  // ORDERS
  // =========================
  orders: {
    placeOrder: async (data: any) => {
      const response = await API.post(
        "/api/orders/place",
        data
      );

      return response.data;
    },

    getOrders: async (userId: number) => {
      const response = await API.get(
        `/api/orders/${userId}`
      );

      return response.data;
    },

    trackOrder: async (
      orderId: number
    ) => {
      const response = await API.get(
        `/api/orders/track/${orderId}`
      );

      return response.data;
    },
  },

  // =========================
  // BOOKINGS
  // =========================
  bookings: {
    createBooking: async (data: any) => {
      const response = await API.post(
        "/api/bookings/create",
        data
      );

      return response.data;
    },

    getUserBookings: async (
      userId: number
    ) => {
      const response = await API.get(
        `/api/bookings/user/${userId}`
      );

      return response.data;
    },

    getSlots: async () => {
      const response = await API.get(
        "/api/bookings/slots"
      );

      return response.data;
    },
  },

  // =========================
  // ADMIN
  // =========================
  admin: {
    getDashboard: async () => {
      const response = await API.get(
        "/api/admin/dashboard"
      );

      return response.data;
    },
  },
};