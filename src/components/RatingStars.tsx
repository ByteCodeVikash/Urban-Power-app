import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { Typography } from './Typography';
import { Colors, Spacing } from '../constants/Theme';

interface RatingStarsProps {
  rating: number;
  reviews?: number;
  size?: number;
  showText?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  reviews,
  size = 16,
  showText = true,
}) => {
  return (
    <View style={styles.container}>
      <Star
        fill={Colors.light.warning}
        color={Colors.light.warning}
        size={size}
      />
      {showText && (
        <Typography variant="body2" weight="600" style={styles.ratingText}>
          {rating.toFixed(1)}
        </Typography>
      )}
      {showText && reviews !== undefined && (
        <Typography variant="caption" color={Colors.light.textSecondary}>
          ({reviews}k)
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: Spacing.xs,
    marginRight: Spacing.xs,
  },
});
