import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { RootStackParamList } from './Types';
import { useAuthStore } from '../store/useAuthStore';

// Navigators
import TabNavigator from './TabNavigator';

// Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import CategoryScreen from '../screens/Services/CategoryScreen';
import ServiceDetailScreen from '../screens/Services/ServiceDetailScreen';
import ServiceBookingFlowScreen from '../screens/Services/ServiceBookingFlowScreen';
import CartScreen from '../screens/Main/CartScreen';
import BookingsScreen from '../screens/Services/BookingsScreen';
import RewardsScreen from '../screens/Services/RewardsScreen';
import GeneralBookingSuccessScreen from '../screens/Services/GeneralBookingSuccessScreen';
import ShopCategoryScreen from '../screens/Shop/ShopCategoryScreen';
import ShopSubCategoryScreen from '../screens/Shop/ShopSubCategoryScreen';
import ShopProductListScreen from '../screens/Shop/ShopProductListScreen';
import GroceryCategoryScreen from '../screens/Main/GroceryCategoryScreen';
import GrocerySubCategoryScreen from '../screens/Main/GrocerySubCategoryScreen';
import GroceryProductListScreen from '../screens/Main/GroceryProductListScreen';
import KabadiCategoryScreen from '../screens/Kabadi/KabadiCategoryScreen';
import KabadiSubCategoryScreen from '../screens/Kabadi/KabadiSubCategoryScreen';
import KabadiFormScreen from '../screens/Kabadi/KabadiFormScreen';
import ServiceScreen from '../screens/Main/ServiceScreen';
import ServiceBookingScreen from '../screens/Services/ServiceBookingScreen';

// New Modules
import TechnicianDashboard from '../screens/Technician/TechnicianDashboard';
import TechnicianLoginScreen from '../screens/Technician/TechnicianLoginScreen';
import TechnicianJobDetailScreen from '../screens/Technician/TechnicianJobDetailScreen';
import TechnicianEarningsScreen from '../screens/Technician/TechnicianEarningsScreen';
import AdminDashboard from '../screens/Admin/AdminDashboard';
import AdminUserManagementScreen from '../screens/Admin/AdminUserManagementScreen';
import AdminOrderListScreen from '../screens/Admin/AdminOrderListScreen';
import ServiceTrackingScreen from '../screens/Services/ServiceTrackingScreen';
import OrderTrackingScreen from '../screens/Shop/OrderTrackingScreen';
import SavedAddressesScreen from '../screens/Main/SavedAddressesScreen';
import MyBookingsScreen from '../screens/Account/MyBookingsScreen';
import WalletScreen from '../screens/Account/WalletScreen';
import SettingsScreen from '../screens/Account/SettingsScreen';
import GenericInfoScreen from '../screens/Support/GenericInfoScreen';
import HelpSupportScreen from '../screens/Support/HelpSupportScreen';
import ProfileScreen from '../screens/Account/ProfileScreen';
import ProductDetailScreen from '../screens/Shop/ProductDetailScreen';
import ShopSubcategoriesScreen from '../screens/Shop/ShopSubcategoriesScreen';
import KabadiBookingScreen from '../screens/Kabadi/KabadiBookingScreen';
import KabadiStatusScreen from '../screens/Kabadi/KabadiStatusScreen';
import KabadiHistoryScreen from '../screens/Kabadi/KabadiHistoryScreen';
import SubcategoryScreen from '../screens/Services/SubcategoryScreen';
import BeautyServiceSubcategoryScreen from '../screens/Services/BeautyServiceSubcategoryScreen';
import BeautyGenderScreen from '../screens/Services/BeautyGenderScreen';
import GenderPickerScreen from '../screens/Services/GenderPickerScreen';
import SearchScreen from '../screens/Main/SearchScreen';
import ServiceCategoryListScreen from '../screens/Services/ServiceCategoryListScreen';
import OffersScreen from '../screens/Shop/OffersScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isAuthenticated, role } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={LoginScreen} />
        ) : (
          <>
            {/* Conditional Root based on Role */}
            {role === 'Technician' ? (
              <Stack.Screen name="TechnicianHub" component={TechnicianDashboard} />
            ) : role === 'Admin' ? (
              <Stack.Screen name="AdminConsole" component={AdminDashboard} />
            ) : (
              <>
                <Stack.Screen name="Main" component={TabNavigator} />
              </>
            )}
            
            {/* Common Shares Screens (Accessible by all or based on logic) */}
            <Stack.Screen name="CategoryDetail" component={CategoryScreen} />
            <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
            <Stack.Screen name="ServiceBookingFlow" component={ServiceBookingFlowScreen} />
            <Stack.Screen name="Bookings" component={BookingsScreen} />
            <Stack.Screen name="Rewards" component={RewardsScreen} />
            <Stack.Screen name="GeneralBookingSuccess" component={GeneralBookingSuccessScreen} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="ShopSubcategories" component={ShopSubcategoriesScreen} />
            
            {/* Kabadi Stack */}
            <Stack.Screen name="KabadiCategory" component={KabadiCategoryScreen} />
            <Stack.Screen name="KabadiSubCategory" component={KabadiSubCategoryScreen} />
            <Stack.Screen name="KabadiForm" component={KabadiFormScreen} />
            <Stack.Screen name="KabadiBooking" component={KabadiBookingScreen} />
            <Stack.Screen name="KabadiStatus" component={KabadiStatusScreen} />
            <Stack.Screen name="KabadiHistory" component={KabadiHistoryScreen} />
            
            {/* Modal Screens */}
            <Stack.Screen name="Cart" component={CartScreen} options={{ presentation: 'modal' }} />
            
            {/* Role-Specific Secondary Screens */}
            <Stack.Screen name="TechnicianLogin" component={TechnicianLoginScreen} />
            <Stack.Screen name="TechnicianJobDetail" component={TechnicianJobDetailScreen} />
            <Stack.Screen name="TechnicianEarnings" component={TechnicianEarningsScreen} />
            <Stack.Screen name="AdminUserManagement" component={AdminUserManagementScreen} />
            <Stack.Screen name="AdminOrderList" component={AdminOrderListScreen} />
            
            {/* Tracking & Management */}
            <Stack.Screen name="ServiceTracking" component={ServiceTrackingScreen} />
            <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
            <Stack.Screen name="SavedAddresses" component={SavedAddressesScreen} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
            <Stack.Screen name="ShopCategory" component={ShopCategoryScreen} />
            <Stack.Screen name="ShopSubCategory" component={ShopSubCategoryScreen} />
            <Stack.Screen name="ShopProductList" component={ShopProductListScreen} />
            <Stack.Screen name="GroceryCategory" component={GroceryCategoryScreen} />
            <Stack.Screen name="GrocerySubCategory" component={GrocerySubCategoryScreen} />
            <Stack.Screen name="GroceryProductList" component={GroceryProductListScreen} />
            <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="MyPlans" component={GenericInfoScreen} />
            <Stack.Screen name="PlusMembership" component={GenericInfoScreen} />
            <Stack.Screen name="MyRating" component={GenericInfoScreen} />
            <Stack.Screen name="ManagePayment" component={GenericInfoScreen} />
            <Stack.Screen name="AboutApp" component={GenericInfoScreen} />
            
            <Stack.Screen name="AccountDetail" component={GenericInfoScreen} />
            <Stack.Screen name="GettingStarted" component={GenericInfoScreen} />
            <Stack.Screen name="PaymentUPICredits" component={GenericInfoScreen} />
            <Stack.Screen name="UPIPlusMembership" component={GenericInfoScreen} />
            <Stack.Screen name="VIPSafety" component={GenericInfoScreen} />
            <Stack.Screen name="ClaimWarranty" component={GenericInfoScreen} />
            <Stack.Screen name="ServiceScreen" component={ServiceScreen} />
            <Stack.Screen name="ServiceBookingScreen" component={ServiceBookingScreen} />
            {/* Subcategory Screens */}
            <Stack.Screen name="Subcategory" component={SubcategoryScreen} />
            <Stack.Screen name="BeautyServiceSubcategory" component={BeautyServiceSubcategoryScreen} />
            <Stack.Screen name="BeautyGender" component={BeautyGenderScreen} />
            <Stack.Screen name="GenderPicker" component={GenderPickerScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="CategoryList" component={ServiceCategoryListScreen} />
            <Stack.Screen name="Offers" component={OffersScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
