import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
} from 'react-native';
import { NetworkImage } from '../../components/NetworkImage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Star, Clock, IndianRupee } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '../../components/Typography';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { CATEGORIES } from '../../constants/MockData';

export default function SubcategoryScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { categoryId, categoryName, gender } = route.params || {};

  const category = CATEGORIES.find((c) => c.id === categoryId);

  // Filter services by gender if provided
  const services = category?.services.filter((s) =>
    gender ? s.gender === gender : true
  ) ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color={Colors.light.text} size={24} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Typography variant="h3" weight="900">{categoryName}</Typography>
          {gender && (
            <Typography variant="tiny" color={Colors.light.primary} weight="700">
              {gender === 'female' ? '♀ Female' : '♂ Male'}
            </Typography>
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Subtitle ── */}
      <View style={styles.subtitleBar}>
        <Typography variant="body2" color={Colors.light.textSecondary} weight="600">
          {services.length} service{services.length !== 1 ? 's' : ''} available
        </Typography>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {services.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => {
              if (item.subcategories && item.subcategories.length > 0) {
                navigation.navigate('BeautyServiceSubcategory', {
                  categoryId,
                  categoryName,
                  serviceId: item.id,
                  serviceTitle: item.title,
                  subcategories: item.subcategories,
                  gender,
                });
                return;
              }
              navigation.navigate('ServiceBookingScreen', {
                categoryId,
                categoryName,
                selectedServiceId: item.id,
                gender,
              });
            }}
          >
            <NetworkImage 
              source={{ uri: item.image }} 
              style={styles.cardImage} 
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
              style={styles.cardGradient}
            />
            {/* Price badge */}
            <View style={styles.priceBadge}>
              <IndianRupee color={Colors.light.primary} size={12} />
              <Typography variant="body2" weight="900" color={Colors.light.primary}>
                {item.price}
              </Typography>
            </View>
            <View style={styles.contentOverlay}>
              <View style={styles.cardBody}>
              <Typography variant="h4" weight="800" color="#fff" style={styles.serviceTitle}>
                {item.title}
              </Typography>
              <View style={styles.metaRow}>
                <Star size={12} color="#F59E0B" fill="#F59E0B" />
                <Typography variant="tiny" weight="700" color="#fff" style={{ marginLeft: 4 }}>
                  {item.rating}
                </Typography>
                <Typography variant="tiny" color="rgba(255,255,255,0.7)" style={{ marginLeft: 6 }}>
                  ({item.reviews}k reviews)
                </Typography>
                <Clock size={12} color="rgba(255,255,255,0.8)" style={{ marginLeft: 12 }} />
                <Typography variant="tiny" color="rgba(255,255,255,0.8)" style={{ marginLeft: 4 }}>
                  {item.duration}
                </Typography>
              </View>
            </View>

              <View style={styles.bookBtn}>
                <Typography variant="tiny" weight="900" color={Colors.light.primary}>
                  BOOK NOW
                </Typography>
              </View>
            </View>
          </Pressable>
        ))}

        {services.length === 0 && (
          <View style={styles.emptyState}>
            <Typography variant="h4" weight="800" align="center" color={Colors.light.textMuted}>
              No services found
            </Typography>
            <Typography variant="body2" align="center" color={Colors.light.textMuted} style={{ marginTop: 8 }}>
              Please go back and try another option.
            </Typography>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: { alignItems: 'center' },
  subtitleBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  listContent: {
    padding: Spacing.lg,
  },
  card: {
    borderRadius: BorderRadius.xxl,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    position: 'relative',
    ...Shadows.light.md,
  },
  cardPressed: { opacity: 0.92, transform: [{ scale: 0.985 }] },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  priceBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    ...Shadows.light.sm,
    gap: 2,
    zIndex: 2,
  },
  contentOverlay: {
    minHeight: 200,
    justifyContent: 'flex-end',
    padding: Spacing.md,
    zIndex: 2,
  },
  cardBody: {
    width: '100%',
  },
  serviceTitle: {
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  bookBtn: {
    alignSelf: 'flex-end',
    marginTop: Spacing.lg,
    backgroundColor: Colors.light.white,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
});
