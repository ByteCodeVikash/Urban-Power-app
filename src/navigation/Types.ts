import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  'My Bookings': undefined;
  Account: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<TabParamList>;
  GroceryProducts: { categoryId: string; categoryName: string };
  MapScreen:
    | {
        returnScreen?: string;
        initialLocation?: { latitude: number; longitude: number };
      }
    | undefined;

  // Services Module
  CategoryList: undefined;
  CategoryDetail: { categoryId: string; categoryName: string; isTab?: boolean };
  ServiceDetail: { serviceId: string; serviceTitle: string };
  ServiceBookingFlow: { categoryId: string; categoryName: string };
  ServiceScreen: { categoryId: string; categoryName: string };
  ServiceBookingScreen: {
    categoryId: string;
    categoryName: string;
    selectedServiceId?: string;
    subcategoryName?: string;
    gender?: string;
  };
  ServiceTracking: { bookingId: string };
  DateSelection: {
    serviceId: string;
    returnScreen: keyof RootStackParamList;
    initialDate?: string;
  };
  TimeslotSelection: {
    serviceId: string;
    date: string;
    returnScreen: keyof RootStackParamList;
    initialTimeslotId?: string;
  };

  // Grocery Stack
  GroceryCategory: undefined;
  GrocerySubCategory: { categoryId: string; categoryName: string };
  GroceryProductList: {
    categoryId: string;
    subcategoryName: string;
    categoryName: string;
  };

  // Shop Module
  ShopCategory: undefined;
  ShopSubCategory: { categoryId: string; categoryName: string };
  ShopProductList: {
    categoryId: string;
    subcategoryName: string;
    categoryName: string;
  };
  ProductDetail: { productId: string; productTitle: string };
  ShopSubcategories: { categoryId: string; categoryName: string };
  OrderTracking: { orderId: string };

  // Kabadi Module
  KabadiCategory: undefined;
  KabadiSubCategory: { categoryId: string; categoryName: string };
  KabadiForm: {
    categoryId: string;
    categoryName: string;
    subcategoryName: string;
  };
  KabadiBooking: undefined;
  KabadiStatus: { bookingId: string };
  KabadiHistory: undefined;

  // Scrap Foundation Module
  ScrapCategories: undefined;
  ScrapItemList: { categoryId: string; categoryName: string };
  ScrapItemDetails: { itemId: string; itemTitle: string };

  // Beautician Module
  BeauticianCategories: undefined;
  BeauticianServices:
    | { categoryId?: string; categoryName?: string }
    | undefined;
  BeauticianServiceDetails: { serviceId: string; serviceTitle: string };

  // Maintenance Module
  MaintenanceCategories: undefined;
  MaintenanceServices:
    | { categoryId?: string; categoryName?: string }
    | undefined;
  MaintenanceServiceDetails: { serviceId: string; serviceTitle: string };
  MaintenanceBooking: undefined;

  // Modular Views (Roles)
  TechnicianHub: undefined;
  TechnicianJobDetail: { jobId: string };
  TechnicianEarnings: undefined;
  AdminConsole: undefined;
  AdminUserManagement: undefined;
  AdminOrderList: undefined;
  AdminServiceConfig: undefined;

  SavedAddresses:
    | { latitude?: number; longitude?: number; address?: string }
    | undefined;
  HelpSupport: undefined;

  // Shared
  Cart: undefined;
  Rewards: undefined;
  Bookings: undefined;
  GeneralBookingSuccess: { title: string; date: string; address: string };

  // Subcategory screens
  Subcategory: { categoryId: string; categoryName: string; gender?: string };
  BeautyServiceSubcategory: {
    categoryId: string;
    categoryName: string;
    serviceId: string;
    serviceTitle: string;
    subcategories: string[];
    gender?: string;
  };
  BeautyGender: undefined;
  GenderPicker: { categoryId: string; categoryName: string };

  // Account Module
  MyBookings: undefined;
  MyPlans: undefined;
  Wallet: undefined;
  PlusMembership: undefined;
  MyRating: undefined;
  ManageAddresses: undefined;
  ManagePayment: undefined;
  Settings: undefined;
  AboutApp: undefined;

  // Support Module
  GettingStarted: undefined;
  PaymentUPICredits: undefined;
  UPIPlusMembership: undefined;
  VIPSafety: undefined;
  ClaimWarranty: undefined;
  AccountDetail: undefined;
  EditProfile: undefined;
  Search: undefined;
  Offers: undefined;
  ComingSoon: undefined;
};
