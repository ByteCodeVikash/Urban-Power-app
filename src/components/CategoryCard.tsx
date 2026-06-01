import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { NetworkImage } from './NetworkImage';
import { LinearGradient } from 'expo-linear-gradient';
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
  LucideIcon,
} from 'lucide-react-native';
import { Typography } from './Typography';
import { Colors, BorderRadius, Shadows, Spacing } from '../constants/Theme';

// ── Icon map: icon key → Lucide component ─────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  sparkles:    Sparkles,
  scissors:    Scissors,
  wrench:      Wrench,
  shop:        ShoppingBag,
  apple:       ShoppingBasket,
  kabadi:      Recycle,
  pest:        Bug,
  massage:     Hand,
  gardening:   Flower2,
  packers:     PackageOpen,
  maintenance: Settings2,
  autoservice: Car,
  learning:    GraduationCap,
  event:       CalendarDays,
  business:    Briefcase,
  workforce:   Users,
  petcare:     PawPrint,
};

interface CategoryCardProps {
  category?: {
    id: string;
    name: string;
    icon: string;
    color?: string;
  };
  loading?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  hideText?: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  loading = false,
  onPress,
  style,
  hideText = false,
}) => {
  if (loading || !category) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.skeletonContainer}>
          <View style={styles.skeletonIcon} />
          {!hideText && <View style={styles.skeletonText} />}
        </View>
      </View>
    );
  }

  const isUrl = category.icon.startsWith('http');
  const IconComponent = ICON_MAP[category.icon] ?? Sparkles;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.container, style]}
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <LinearGradient
        colors={['#F5F3FF', '#FFFFFF']}
        style={styles.iconContainer}
      >
        {isUrl ? (
          <NetworkImage 
            source={{ uri: category.icon }} 
            style={styles.iconImage} 
            resizeMode="contain"
          />
        ) : (
          <IconComponent color={Colors.light.primary} size={28} />
        )}
      </LinearGradient>
      {!hideText && (
        <Typography variant="tiny" weight="800" align="center" color={Colors.light.text} style={styles.text}>
          {category.name}
        </Typography>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 80,
    alignItems: 'center',
  },
  skeletonContainer: {
    alignItems: 'center',
  },
  skeletonIcon: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.surfaceAlt,
  },
  skeletonText: {
    width: 40,
    height: 10,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.light.surfaceAlt,
    marginTop: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    ...Shadows.light.sm,
  },
  iconImage: {
    width: 40,
    height: 40,
  },
  text: {
    marginTop: 6,
    lineHeight: 14,
  },
});

