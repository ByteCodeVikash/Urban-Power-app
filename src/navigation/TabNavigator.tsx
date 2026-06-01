import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Calendar, User } from 'lucide-react-native';
import { TabParamList } from './Types';
import { Colors, Shadows } from '../constants/Theme';
import { HomeTopHeader } from '../components/home/HomeTopHeader';

import HomeScreen from '../screens/Main/HomeScreen';
import BookingsScreen from '../screens/Services/BookingsScreen';
import ProfileScreen from '../screens/Account/ProfileScreen';

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<string>('Home');
  const isHome = activeTab === 'Home';

  return (
    <View style={styles.safeArea}>
      {isHome && <HomeTopHeader />}

      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: Colors.light.primary,
          tabBarInactiveTintColor: '#777777',
          tabBarStyle: [
            styles.bottomTabBar,
            { height: 70 + insets.bottom, paddingBottom: insets.bottom > 0 ? insets.bottom : 12 },
          ],
          tabBarLabelStyle: styles.bottomTabLabel,
          tabBarIcon: ({ color, focused }) => {
            const size = 24;
            const strokeWidth = focused ? 2.5 : 2;
            if (route.name === 'Home') {
              return <Home size={size} color={color} strokeWidth={strokeWidth} />;
            }
            if (route.name === 'My Bookings') {
              return <Calendar size={size} color={color} strokeWidth={strokeWidth} />;
            }
            if (route.name === 'Account') {
              return <User size={size} color={color} strokeWidth={strokeWidth} />;
            }
            return null;
          },
        })}
        screenListeners={{
          state: (e) => {
            const state = e.data.state;
            const routeName = state.routes[state.index]?.name ?? 'Home';
            setActiveTab(routeName);
          },
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="My Bookings" component={BookingsScreen} />
        <Tab.Screen name="Account" component={ProfileScreen} />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.white },
  bottomTabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    ...Shadows.light.md,
    elevation: 8,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
  },
  bottomTabLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
});
