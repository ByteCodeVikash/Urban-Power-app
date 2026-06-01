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
  
  // Services Module
  CategoryList: undefined;
  CategoryDetail: { categoryId: string; categoryName: string };
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
  
  // Grocery Stack
  GroceryCategory: undefined;
  GrocerySubCategory: { categoryId: string; categoryName: string };
  GroceryProductList: { categoryId: string; subcategoryName: string; categoryName: string };

  // Shop Module
  ShopCategory: undefined;
  ShopSubCategory: { categoryId: string; categoryName: string };
  ShopProductList: { categoryId: string; subcategoryName: string; categoryName: string };
  ProductDetail: { productId: string; productTitle: string };
  ShopSubcategories: { categoryId: string; categoryName: string };
  OrderTracking: { orderId: string };
  
  // Kabadi Module
  KabadiCategory: undefined;
  KabadiSubCategory: { categoryId: string; categoryName: string };
  KabadiForm: { categoryId: string; categoryName: string; subcategoryName: string };
  KabadiBooking: undefined;
  KabadiStatus: { bookingId: string };
  KabadiHistory: undefined;
  
  // Modular Views (Roles)
  TechnicianLogin: undefined;
  TechnicianHub: undefined;
  TechnicianJobDetail: { jobId: string };
  TechnicianEarnings: undefined;
  AdminConsole: undefined;
  AdminUserManagement: undefined;
  AdminOrderList: undefined;
  AdminServiceConfig: undefined;
  
  SavedAddresses: undefined;
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
  Search: undefined;
  Offers: undefined;
};
