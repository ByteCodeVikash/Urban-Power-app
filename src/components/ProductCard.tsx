import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { NetworkImage } from './NetworkImage';
import { ShoppingBag } from 'lucide-react-native';
import { RatingStars } from './RatingStars';
import { Typography } from './Typography';
import { Colors, Spacing, BorderRadius, Shadows } from '../constants/Theme';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    price: number;
    image: string;
    category: string;
    rating?: number;
    reviews?: number;
  };
  onPress?: () => void;
  onAddPress?: () => void;
  style?: any;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddPress,
  style,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && { transform: [{ scale: 0.98 }] },
        style,
      ]}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <NetworkImage 
          source={{ uri: product.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop' }} 
          style={styles.image} 
          resizeMode="cover" 
        />
        <View style={styles.badge}>
          <Typography variant="tiny" weight="700" color={Colors.light.primary}>20% OFF</Typography>
        </View>
      </View>
      
      <View style={styles.content}>
        <Typography variant="tiny" color={Colors.light.textMuted} weight="600" numberOfLines={1} style={{ marginBottom: 2 }}>
          {product.category.toUpperCase()}
        </Typography>
        <Typography variant="body2" weight="700" numberOfLines={1}>
          {product.title}
        </Typography>
        
        <View style={styles.ratingRow}>
          <RatingStars rating={product.rating || 4.5} size={12} showText={false} />
          <Typography variant="tiny" color={Colors.light.textMuted} style={{ marginLeft: 4 }}>
            ({product.reviews || 120})
          </Typography>
        </View>
        
        <View style={styles.footer}>
          <Typography variant="body1" weight="800">₹{product.price}</Typography>
          <Pressable 
            style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
            onPress={onAddPress}
          >
            <ShoppingBag size={14} color={Colors.light.white} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    ...Shadows.light.sm,
    marginBottom: Spacing.xs,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  content: {
    padding: Spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.light.sm,
  },
  addButtonPressed: {
    backgroundColor: Colors.light.primaryDark,
  },
});
