import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { NetworkImage } from './NetworkImage';
import { MinimalService } from '../constants/MockData';
import { Typography } from './Typography';
import { RatingStars } from './RatingStars';
import { Button } from './Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../constants/Theme';

interface ServiceCardProps {
  service?: MinimalService;
  loading?: boolean;
  onAdd?: () => void;
  onPress?: () => void;
  style?: any;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  loading = false,
  onAdd,
  onPress,
  style,
}) => {
  if (loading || !service) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.skeletonContainer}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonRating} />
            <View style={styles.skeletonPrice} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && { transform: [{ scale: 0.98 }] },
        style,
      ]}
      onPress={onPress}
    >
      <NetworkImage 
        source={{ uri: service.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop' }} 
        style={styles.image} 
        resizeMode="cover"
      />

      <View style={styles.content}>
        <View>
          <Typography variant="body1" weight="700" numberOfLines={1}>
            {service.title}
          </Typography>
          <View style={styles.ratingContainer}>
            <RatingStars rating={service.rating} reviews={service.reviews} />
          </View>
        </View>

        <View style={styles.footer}>
          <View>
            <View style={styles.priceRow}>
              <Typography variant="h4" weight="800" color={Colors.light.text}>
                ₹{service.price}
              </Typography>
              <Typography variant="tiny" color={Colors.light.textMuted} style={{ marginLeft: 4, textDecorationLine: 'line-through' }}>
                ₹{Math.floor(service.price * 1.2)}
              </Typography>
            </View>
            <Typography variant="tiny" color={Colors.light.primary} weight="600">
               ~ {service.duration}
            </Typography>
          </View>

          <Button
            title="Add"
            size="sm"
            variant="secondary"
            onPress={() => onAdd?.()}
            style={styles.addButton}
          />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    ...Shadows.light.md,
  },
  skeletonContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  skeletonImage: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.surfaceAlt,
  },
  skeletonContent: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'space-between',
  },
  skeletonTitle: {
    width: '80%',
    height: 18,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.light.surfaceAlt,
  },
  skeletonRating: {
    width: '40%',
    height: 12,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.light.surfaceAlt,
  },
  skeletonPrice: {
    width: '30%',
    height: 18,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.light.surfaceAlt,
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: BorderRadius.lg,
  },
  imagePlaceholder: {
    backgroundColor: Colors.light.surfaceAlt,
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
    paddingVertical: Spacing.xs,
    justifyContent: 'space-between',
  },
  ratingContainer: {
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  addButton: {
    paddingHorizontal: Spacing.lg,
    height: 32,
    borderRadius: BorderRadius.md,
  },
});

