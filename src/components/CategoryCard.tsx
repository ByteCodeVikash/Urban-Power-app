import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
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
import { Colors, BorderRadius, Shadows, Spacing } from '../constants/Theme';

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
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  loading = false,
  onPress,
  style,
  hideText = false,
  imageHeight,
}) => {
  if (loading || !category) {
    return (
      <View style={[styles.container, style]}>
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
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.container, style]}
      onPress={onPress}
    >
      <View
        style={[
          styles.imageContainer,
          imageHeight !== undefined && { height: imageHeight },
        ]}
      >
        {imageUrl ? (
          <NetworkImage
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <IconComponent color={Colors.light.primary} size={32} />
        )}
      </View>
      {!hideText && (
        <View style={styles.textContainer}>
          <Typography
            variant="tiny"
            weight="700"
            align="center"
            color={Colors.light.text}
            style={styles.text}
            numberOfLines={2}
          >
            {category.name}
          </Typography>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    ...Shadows.light.sm,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    overflow: 'hidden',
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
  textContainer: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    minHeight: 40, // To accommodate 2 lines of text
    justifyContent: 'center',
  },
  text: {
    lineHeight: 14,
  },
});
