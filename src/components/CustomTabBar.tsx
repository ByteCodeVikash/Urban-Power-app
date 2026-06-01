import React from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { Colors, Spacing, Shadows, BorderRadius } from '../constants/Theme';
import { Typography } from './Typography';
import { ShoppingBag, ShoppingBasket, Recycle, ShoppingCart } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const TAB_BAR_WIDTH = width - Spacing.lg * 2;

// Visible routes in the tab bar
const VISIBLE_ROUTES = ['Shopping', 'Grocery', 'Kabadi', 'Cart'];
const TAB_COUNT = VISIBLE_ROUTES.length;
const TAB_WIDTH = TAB_BAR_WIDTH / TAB_COUNT;

const getIcon = (routeName: string, color: string, size: number) => {
  switch (routeName) {
    case 'Shopping': return <ShoppingBag color={color} size={size} />;
    case 'Grocery': return <ShoppingBasket color={color} size={size} />;
    case 'Kabadi':  return <Recycle color={color} size={size} />;
    case 'Cart':    return <ShoppingCart color={color} size={size} />;
    default:        return <ShoppingBag color={color} size={size} />;
  }
};

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  // Map full route index to visible-only index for indicator position
  const visibleRoutes = state.routes.filter((r) => VISIBLE_ROUTES.includes(r.name));
  const visibleIndex = visibleRoutes.findIndex((r) => r.key === state.routes[state.index]?.key);
  const indicatorPosition = visibleIndex >= 0 ? visibleIndex : 0;

  const translateX = useSharedValue(indicatorPosition * TAB_WIDTH);

  React.useEffect(() => {
    translateX.value = withSpring(indicatorPosition * TAB_WIDTH, {
      damping: 15,
      stiffness: 120,
    });
  }, [indicatorPosition]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={[styles.container, { bottom: Math.max(insets.bottom, Spacing.lg) }]}>
      <View style={styles.tabBar}>
        <Animated.View style={[styles.indicator, indicatorStyle]} />

        {state.routes.map((route, index) => {
          // Skip hidden tabs (Shop)
          if (!VISIBLE_ROUTES.includes(route.name)) return null;

          const descriptor = descriptors[route.key];
          if (!descriptor) return null;

          const { options } = descriptor;
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
            >
              <View style={styles.iconContainer}>
                {getIcon(
                  route.name,
                  isFocused ? Colors.light.primary : Colors.light.textSecondary,
                  24
                )}
                <Typography
                  variant="tiny"
                  color={isFocused ? Colors.light.primary : Colors.light.textSecondary}
                  style={[styles.label, isFocused && styles.activeLabel]}
                  numberOfLines={1}
                >
                  {label as string}
                </Typography>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    width: TAB_BAR_WIDTH,
    height: 68,
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xxl,
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    ...Shadows.light.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  indicator: {
    position: 'absolute',
    width: TAB_WIDTH - Spacing.sm * 2,
    height: 48,
    backgroundColor: Colors.light.primaryLight,
    borderRadius: BorderRadius.xl,
    left: Spacing.xs + Spacing.sm,
  },
  label: {
    marginTop: 4,
    fontWeight: '600',
    fontSize: 10,
    opacity: 0.8,
  },
  activeLabel: {
    fontWeight: '800',
    opacity: 1,
  },
});
