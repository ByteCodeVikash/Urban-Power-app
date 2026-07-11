import React from 'react';
import { StyleSheet, Pressable, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {
  Sparkles,
  Scissors,
  Wrench,
  ShoppingBag,
  ShoppingBasket,
  Recycle,
  Bug,
  Hand,
  Flower2,
  PackageOpen,
  Settings2,
  Car,
  GraduationCap,
  CalendarDays,
  Briefcase,
  Users,
  PawPrint,
  Smile,
  Droplet,
  Paintbrush,
  Wind,
  Zap,
  LucideIcon,
} from 'lucide-react-native';
import { NetworkImage } from './NetworkImage';
import { Typography } from './Typography';
import { Colors, BorderRadius, Spacing } from '../constants/Theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ── Icon map: icon key → Lucide component ─────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  scissors: Scissors,
  wrench: Wrench,
  shop: ShoppingBag,
  apple: ShoppingBasket,
  kabadi: Recycle,
  pest: Bug,
  massage: Hand,
  gardening: Flower2,
  packers: PackageOpen,
  maintenance: Settings2,
  autoservice: Car,
  learning: GraduationCap,
  event: CalendarDays,
  business: Briefcase,
  workforce: Users,
  petcare: PawPrint,
  'face-woman': Smile,
  water: Droplet,
  droplet: Droplet,
  spa: Flower2,
  brush: Paintbrush,
  wind: Wind,
  zap: Zap,
};

interface CategoryCardProps {
  category?: {
    id: string;
    name: string;
    icon: string;
    image?: string;
    color?: string;
  };
  loading?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  hideText?: boolean;
  imageHeight?: number;
  isActive?: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  loading = false,
  onPress,
  style,
  hideText = false,
  imageHeight,
  isActive = true,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (loading || !isActive) return;
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  if (loading || !category) {
    return (
      <View style={[styles.container, styles.containerInactive, style]}>
        <View
          style={[
            styles.skeletonImage,
            imageHeight !== undefined && { height: imageHeight },
          ]}
        />
        {!hideText && <View style={styles.skeletonText} />}
      </View>
    );
  }

  const imageUrl =
    category.image ||
    (category.icon?.startsWith('http') ? category.icon : null);
  const IconComponent = ICON_MAP[category.icon] ?? Sparkles;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={loading}
      style={[
        styles.container,
        isActive ? styles.containerActive : styles.containerInactive,
        style,
        animatedStyle,
      ]}
    >
      {/* Visual Status Badge */}
      <View
        style={[
          styles.badge,
          isActive ? styles.badgeActive : styles.badgeInactive,
        ]}
      >
        <Typography
          variant="tiny"
          style={isActive ? styles.badgeTextActive : styles.badgeTextInactive}
          numberOfLines={1}
        >
          {isActive ? 'Available' : 'Soon'}
        </Typography>
      </View>

      <View
        style={[
          styles.imageContainer,
          imageHeight !== undefined && { height: imageHeight },
        ]}
      >
        {imageUrl ? (
          <NetworkImage
            source={
              typeof imageUrl === 'number'
                ? imageUrl
                : typeof imageUrl === 'object' && imageUrl !== null
                ? imageUrl
                : { uri: imageUrl }
            }
            style={[styles.image, !isActive && styles.imageMuted]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.iconWrapper,
              isActive ? styles.iconWrapperActive : styles.iconWrapperInactive,
            ]}
          >
            <IconComponent
              color={isActive ? Colors.light.primary : Colors.light.textMuted}
              size={28}
            />
          </View>
        )}
      </View>
      {!hideText && (
        <View style={styles.textContainer}>
          <Typography
            variant="tiny"
            weight="700"
            align="center"
            color={isActive ? Colors.light.text : Colors.light.textSecondary}
            style={styles.text}
            numberOfLines={2}
          >
            {category.name}
          </Typography>
        </View>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  containerActive: {
    borderColor: Colors.light.borderLight,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    opacity: 1,
  },
  containerInactive: {
    borderColor: '#E2E8F0',
    opacity: 0.6,
    elevation: 0,
    shadowOpacity: 0,
  },
  skeletonImage: {
    width: '100%',
    height: 80,
    backgroundColor: Colors.light.surfaceAlt,
  },
  skeletonText: {
    width: '60%',
    height: 10,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.light.surfaceAlt,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    alignSelf: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 80,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageMuted: {
    opacity: 0.5,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    backgroundColor: Colors.light.primaryLight,
  },
  iconWrapperInactive: {
    backgroundColor: '#E2E8F0',
  },
  textContainer: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    minHeight: 40, // To accommodate 2 lines of text
    justifyContent: 'center',
  },
  text: {
    lineHeight: 14,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: BorderRadius.xs - 2,
    zIndex: 10,
  },
  badgeActive: {
    backgroundColor: '#D1FAE5',
    borderWidth: 0.5,
    borderColor: '#34D399',
  },
  badgeInactive: {
    backgroundColor: '#F1F5F9',
    borderWidth: 0.5,
    borderColor: '#94A3B8',
  },
  badgeTextActive: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#065F46',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    lineHeight: 10,
  },
  badgeTextInactive: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    lineHeight: 10,
  },
});
