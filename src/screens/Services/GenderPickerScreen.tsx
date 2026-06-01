/**
 * GenderPickerScreen — Generic gender selector.
 * Receives { categoryId, categoryName } as route params.
 * Derives Female / Male service counts from CATEGORIES and navigates
 * to SubcategoryScreen with the chosen gender.
 */
import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '../../components/Typography';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { CATEGORIES } from '../../constants/MockData';

const { height } = Dimensions.get('window');

const GENDER_META: Record<
  string,
  { label: string; emoji: string; accentColor: string; coverImage: string }
> = {
  female: {
    label: 'Female',
    emoji: '♀',
    accentColor: '#E91E63',
    coverImage:
      'https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=800&auto=format&fit=crop',
  },
  male: {
    label: 'Male',
    emoji: '♂',
    accentColor: '#1565C0',
    coverImage:
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop',
  },
};

export default function GenderPickerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { categoryId, categoryName } = route.params || {};

  const category = CATEGORIES.find((c) => c.id === categoryId);

  const genderOptions = (['female', 'male'] as const).map((g) => {
    const services = category?.services.filter((s) => s.gender === g) ?? [];
    const meta = { ...GENDER_META[g] };
    
    // Customize label for Massage category
    if (categoryId === 'c10') {
      meta.label = g === 'female' ? 'Massage for Women' : 'Massage for Men';
    }

    // Use first service image if available, otherwise fallback to default
    const image = services[0]?.image ?? meta.coverImage;
    return { key: g, services, image, ...meta };
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color={Colors.light.text} size={24} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Typography variant="h3" weight="900">{categoryName}</Typography>
          <Typography variant="tiny" color={Colors.light.textSecondary} weight="600">
            Select your preference
          </Typography>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.subheadingContainer}>
        <Typography variant="h4" weight="800">Who is this for?</Typography>
        <Typography variant="body2" color={Colors.light.textSecondary}>
          Choose a category to see personalised services
        </Typography>
      </View>

      {/* ── Gender Cards ── */}
      <View style={styles.cardsContainer}>
        {genderOptions.map((opt) => (
          <Pressable
            key={opt.key}
            style={({ pressed }) => [styles.genderCard, pressed && styles.cardPressed]}
            onPress={() =>
              navigation.navigate('Subcategory', {
                categoryId,
                categoryName,
                gender: opt.key,
              })
            }
          >
            <ImageBackground
              source={{ uri: opt.image }}
              style={styles.cardImageBg}
              imageStyle={{ borderRadius: BorderRadius.xxl }}
            >
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.75)']}
                style={[styles.cardGradient, { borderRadius: BorderRadius.xxl }]}
              />

              {/* Emoji badge */}
              <View style={[styles.emojiBadge, { backgroundColor: opt.accentColor }]}>
                <Typography variant="h4" color="#fff" weight="900">{opt.emoji}</Typography>
              </View>

              {/* Bottom info */}
              <View style={styles.cardInfo}>
                <Typography variant="h2" weight="900" color="#fff">{opt.label}</Typography>

                <View style={[styles.taglinePill, { backgroundColor: opt.accentColor + '44' }]}>
                  <Typography variant="tiny" weight="800" color="#fff">
                    {opt.services.length} service{opt.services.length !== 1 ? 's' : ''} available
                  </Typography>
                </View>

                {/* Service name chips */}
                <View style={styles.serviceChips}>
                  {opt.services.slice(0, 3).map((s) => (
                    <View key={s.id} style={styles.chip}>
                      <Typography variant="tiny" weight="700" color="rgba(255,255,255,0.9)">
                        {s.title}
                      </Typography>
                    </View>
                  ))}
                  {opt.services.length > 3 && (
                    <View style={styles.chip}>
                      <Typography variant="tiny" weight="700" color="rgba(255,255,255,0.9)">
                        +{opt.services.length - 3} more
                      </Typography>
                    </View>
                  )}
                </View>

                <View style={[styles.selectBtn, { backgroundColor: opt.accentColor }]}>
                  <Typography variant="tiny" weight="900" color="#fff">SELECT →</Typography>
                </View>
              </View>
            </ImageBackground>
          </Pressable>
        ))}
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center', alignItems: 'center',
  },
  headerCenter: { alignItems: 'center' },
  subheadingContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    gap: 4,
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.lg,
  },
  genderCard: {
    flex: 1,
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    ...Shadows.light.lg,
  },
  cardPressed: { opacity: 0.93, transform: [{ scale: 0.98 }] },
  cardImageBg: { flex: 1, justifyContent: 'flex-end' },
  cardGradient: { ...StyleSheet.absoluteFillObject },
  emojiBadge: {
    position: 'absolute',
    top: Spacing.lg, right: Spacing.lg,
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.light.md,
  },
  cardInfo: { padding: Spacing.xl, paddingTop: Spacing.lg },
  taglinePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: BorderRadius.full,
    marginTop: 4, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  serviceChips: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 6, marginBottom: Spacing.md,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  selectBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: BorderRadius.full,
    ...Shadows.light.sm,
  },
});
