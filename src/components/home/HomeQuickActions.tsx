import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ShoppingBag, Package, Truck, ShoppingCart } from 'lucide-react-native';
import { Typography } from '../Typography';
import { Colors, Spacing, Shadows } from '../../constants/Theme';
import { RootStackParamList } from '../../navigation/Types';
import { useCartStore } from '../../store/useCartStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const QUICK_ACTIONS = [
  { id: 'shop', label: 'Shopping', icon: ShoppingBag, route: 'ShopCategory' as const },
  { id: 'grocery', label: 'Grocery', icon: Package, route: 'GroceryCategory' as const },
  { id: 'kabadi', label: 'Kabadi', icon: Truck, route: 'KabadiCategory' as const },
  { id: 'cart', label: 'Cart', icon: ShoppingCart, route: 'Cart' as const },
];

export function HomeQuickActions() {
  const navigation = useNavigation<NavigationProp>();
  const cartCount = useCartStore((s) =>
    s.items.reduce((total, item) => total + item.quantity, 0),
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {QUICK_ACTIONS.map((action) => {
          const count = action.id === 'cart' ? cartCount : 0;
          const Icon = action.icon;

          return (
            <Pressable
              key={action.id}
              style={styles.item}
              onPress={() => navigation.navigate(action.route)}
            >
              <View style={styles.iconWrapper}>
                <Icon size={24} color={Colors.light.primary} strokeWidth={2.5} />
                {count > 0 && (
                  <View style={styles.badge}>
                    <Typography variant="tiny" color="#fff" weight="700" style={{ fontSize: 9 }}>
                      {count}
                    </Typography>
                  </View>
                )}
              </View>
              <Typography
                variant="tiny"
                weight="700"
                color={Colors.light.text}
                style={styles.label}
              >
                {action.label}
              </Typography>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: Spacing.md,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  iconWrapper: {
    width: 55,
    height: 55,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.light.sm,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  label: {
    textAlign: 'center',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.light.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
