import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Typography } from '../Typography';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';

export function ReferAndGetFreeServicesBanner({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.left}>
        <Typography variant="h3" weight="900" color={Colors.light.primary} style={styles.title}>
          Refer and get free services
        </Typography>
        <Typography variant="body2" color={Colors.light.textSecondary} weight="700" style={styles.subtitle}>
          Invite and get{' '}
          <Typography variant="body2" color={Colors.light.primary} weight="900">
            ₹100
          </Typography>
        </Typography>
      </View>

      <View style={styles.imageWrap}>
        <Image
          source={require('../../../assets/images/banner_beauty.jpg')}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    backgroundColor: Colors.light.primaryLight,
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    borderColor: 'rgba(111,66,229,0.18)',
    ...Shadows.light.sm,
  },
  cardPressed: { opacity: 0.94, transform: [{ scale: 0.99 }] },
  left: { flex: 1, paddingRight: Spacing.md },
  title: { marginBottom: 6 },
  subtitle: { lineHeight: 20 },
  imageWrap: {
    width: 116,
    height: 84,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.light.white,
    borderWidth: 1,
    borderColor: 'rgba(111,66,229,0.12)',
  },
  image: { width: '100%', height: '100%' },
});

