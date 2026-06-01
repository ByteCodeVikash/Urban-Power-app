import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  FlatList,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Truck, ShoppingBag } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/Types';
import {
  useTrendingServices,
  useMostBooked,
  useOffers,
  useCategories,
} from '../../hooks/useServices';
import { useProducts } from '../../hooks/useShop';
import { useCartStore } from '../../store/useCartStore';
import { Typography } from '../../components/Typography';
import { CategoryCard } from '../../components/CategoryCard';
import { ServiceCard } from '../../components/ServiceCard';
import { ProductCard } from '../../components/ProductCard';
import { BannerCarousel } from '../../components/BannerCarousel';
import { SectionHeader } from '../../components/SectionHeader';
import { ReferAndGetFreeServicesBanner } from '../../components/home/ReferAndGetFreeServicesBanner';
import { Colors, Spacing, Shadows, BorderRadius } from '../../constants/Theme';

// ─── Service module grid (centralized config) ───────────────────────────────
const MAIN_VERTICALS = [
  // ── Core Services (keep) ──
  { id: 'c1',      name: 'Cleaning',     icon: 'sparkles' },
  { id: 'c2',      name: 'Beauty',       icon: 'scissors' },
  { id: 'c4',      name: 'Repair',       icon: 'wrench'   },
  // ── Modules ──
  { id: 'shop',    name: 'Shopping',     icon: 'shop',        isModule: true },
  { id: 'grocery', name: 'Grocery',      icon: 'apple',       isModule: true },
  { id: 'kabadi',  name: 'Kabadi',       icon: 'kabadi',      isModule: true },
  // ── Replaced categories ──
  { id: 'c3',      name: 'Maintenance',  icon: 'maintenance' },   // was: AC Repair
  { id: 'c5',      name: 'Auto Service', icon: 'autoservice' },   // was: Plumber
  { id: 'c6',      name: 'Learning',     icon: 'learning'    },   // was: Electrician
  { id: 'c7',      name: 'Event',        icon: 'event'       },   // was: Painting
  { id: 'c8',      name: 'Business',     icon: 'business'    },   // was: Carpenter
  { id: 'c12',     name: 'Workforce',    icon: 'workforce'   },   // was: Smart Home
  { id: 'c14',     name: 'Pet Care',     icon: 'petcare'     },   // was: Car Wash
  // ── Keep unchanged ──
  { id: 'c9',      name: 'Pest Control', icon: 'pest'        },
  { id: 'c10',     name: 'Massage',      icon: 'massage'     },
  { id: 'c13',     name: 'Gardening',    icon: 'gardening'   },
  { id: 'c15',     name: 'Packers',      icon: 'packers'     },
  // ── Removed: Appliance (c11) ──
];



// ─── Banner images (URL-based for reliability) ──────────────────────────────
const BANNERS = [
  { id: 'b1', image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?q=80&w=800&auto=format&fit=crop' }, // Cleaning
  { id: 'b2', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop' }, // Shopping
  { id: 'b3', image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=800&auto=format&fit=crop' }, // Services
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);

  // Cart count for header badge
  const cartCount = useCartStore((s) =>
    s.items.reduce((total, item) => total + item.quantity, 0)
  );

  const { data: trending,   isLoading: loadingTrending,   refetch: refetchTrending   } = useTrendingServices();
  const { data: mostBooked, isLoading: loadingMostBooked, refetch: refetchMostBooked } = useMostBooked();
  const { data: products,   isLoading: loadingProducts,   refetch: refetchProducts   } = useProducts();
  const { data: offers,     isLoading: loadingOffers,     refetch: refetchOffers     } = useOffers();
  const { data: categories, isLoading: loadingCategories, refetch: refetchCategories } = useCategories();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchCategories(),
      refetchTrending(),
      refetchMostBooked(),
      refetchProducts(),
      refetchOffers(),
    ]);
    setRefreshing(false);
  }, [refetchCategories, refetchTrending, refetchMostBooked, refetchProducts, refetchOffers]);

  const renderServiceItem = useCallback(
    ({ item }: any) => (
      <ServiceCard
        service={item}
        onPress={() =>
          navigation.navigate('ServiceDetail', {
            serviceId: item.id,
            serviceTitle: item.title,
          })
        }
        style={styles.horizontalCard}
      />
    ),
    [navigation]
  );

  const renderProductItem = useCallback(
    ({ item }: any) => (
      <ProductCard
        product={item}
        onPress={() =>
          navigation.navigate('ProductDetail', {
            productId: item.id,
            productTitle: item.title,
          })
        }
        style={styles.horizontalProductCard}
      />
    ),
    [navigation]
  );

  const keyExtractor = useCallback((item: any) => item.id, []);

  const mockServices = Array.from({ length: 3 }, (_, i) => ({ id: `ms-${i}` }));
  const mockProducts = Array.from({ length: 3 }, (_, i) => ({ id: `mp-${i}` }));

  // Deals reuse products with a unique key prefix so FlatList keys don't clash
  const dealsKeyExtractor = useCallback((item: any) => `deal-${item.id}`, []);

  // Insets no longer needed as parent handles it
  // const insets = useSafeAreaInsets();

  return (
    <View style={styles.safeArea}>
      {/* ═══════════════════════════════════════════════
          SCROLLABLE BODY
      ═══════════════════════════════════════════════ */}
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.light.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        {/* ── Banner carousel ── */}
        <BannerCarousel data={BANNERS} loading={false} />

        {/* ── Service category grid ── */}
        <View style={styles.moduleSection}>
          <Typography variant="h3" weight="800" style={styles.moduleSectionTitle}>
            What are you looking for?
          </Typography>
          <View style={styles.moduleGrid}>
            {MAIN_VERTICALS.map((item) => (
              <CategoryCard
                key={item.id}
                category={item as any}
                style={styles.moduleItem}
                hideText={false}
                onPress={() => {
                  // ── Module routes — SAME as top taskbar ──
                  if (item.id === 'shop') {
                    navigation.navigate('ShopCategory');
                  } else if (item.id === 'grocery') {
                    navigation.navigate('GroceryCategory');
                  } else if (item.id === 'kabadi') {
                    navigation.navigate('KabadiCategory');

                  // ── Gender-based categories ──
                  } else if (item.id === 'c2') {
                    // Beauty → gender picker
                    navigation.navigate('GenderPicker', {
                      categoryId: 'c2',
                      categoryName: 'Beauty',
                    });
                  } else if (item.id === 'c10') {
                    // Massage → gender picker
                    navigation.navigate('GenderPicker', {
                      categoryId: 'c10',
                      categoryName: 'Massage',
                    });

                  // ── All other service categories → SubcategoryScreen ──
                  } else if (item.id) {
                    navigation.navigate('Subcategory', {
                      categoryId: item.id,
                      categoryName: item.name,
                    });
                  }
                }}
              />
            ))}
          </View>
        </View>

        {/* ── Spotlight cards ── */}
        <View style={styles.spotlightRow}>
          <Pressable
            style={[styles.spotlightCard, { backgroundColor: '#1E1B4B' }]}
            onPress={() => navigation.navigate('ShopCategory')}
          >
            <ShoppingBag color={Colors.light.white} size={24} />
            <Typography
              variant="body1"
              weight="800"
              color={Colors.light.white}
              style={{ marginTop: 8 }}
            >
              Urban Shop
            </Typography>
            <Typography variant="tiny" color="#A5B4FC" weight="700">
              PREMIUM PRODUCTS
            </Typography>
          </Pressable>
          <Pressable
            style={[styles.spotlightCard, { backgroundColor: '#064E3B' }]}
            onPress={() => navigation.navigate('KabadiCategory')}
          >
            <Truck color={Colors.light.white} size={24} />
            <Typography
              variant="body1"
              weight="800"
              color={Colors.light.white}
              style={{ marginTop: 8 }}
            >
              Sell Scrap
            </Typography>
            <Typography variant="tiny" color="#A7F3D0" weight="700">
              CASH ON PICKUP
            </Typography>
          </Pressable>
        </View>

        {/* ── For You ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWrapper}>
            <SectionHeader
              title="For You"
              onSeeAll={() => navigation.navigate('ShopCategory')}
            />
          </View>
          <FlatList
            horizontal
            data={(loadingProducts ? mockProducts : products) ?? []}
            keyExtractor={keyExtractor}
            renderItem={
              loadingProducts
                ? () => <View style={[styles.horizontalProductCard, styles.skeletonProduct]} />
                : renderProductItem
            }
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
        </View>

        {/* ── Keep Shopping For ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWrapper}>
            <SectionHeader
              title="Keep Shopping For"
              onSeeAll={() => navigation.navigate('CategoryList')}
            />
          </View>
          <FlatList
            horizontal
            data={(loadingTrending ? mockServices : trending) ?? []}
            keyExtractor={keyExtractor}
            renderItem={
              loadingTrending
                ? () => <ServiceCard loading style={styles.horizontalCard} />
                : renderServiceItem
            }
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            snapToInterval={280 + Spacing.md}
            decelerationRate="fast"
          />
        </View>

        {/* ── Deals For You ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWrapper}>
            <SectionHeader
              title="Deals For You"
              onSeeAll={() => navigation.navigate('Offers')}
            />
          </View>
          <FlatList
            horizontal
            data={(loadingProducts ? mockProducts : products) ?? []}
            keyExtractor={dealsKeyExtractor}
            renderItem={
              loadingProducts
                ? () => <View style={[styles.horizontalProductCard, styles.skeletonProduct]} />
                : renderProductItem
            }
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
        </View>

        {/* ── Refer & Get Free Services ── */}
        <View style={{ paddingHorizontal: Spacing.lg }}>
          <ReferAndGetFreeServicesBanner onPress={() => {}} />
        </View>

      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.white,
  },

  /* ─── Body ─── */
  container: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },

  /* ─── Service category module grid ─── */
  moduleSection: {
    backgroundColor: Colors.light.white,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.light.xs,
  },
  moduleSectionTitle: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  moduleItem: {
    width: '24%', // Exactly 4 items per row with spacing
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },

  /* ─── Spotlight cards ─── */
  spotlightRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  spotlightCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Shadows.light.md,
  },



  /* ─── Horizontal sections ─── */
  section: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.light.white,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    ...Shadows.light.xs,
  },
  sectionHeaderWrapper: {
    paddingHorizontal: Spacing.lg,
  },
  flatListContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  horizontalCard: {
    width: 280,
    marginRight: Spacing.md,
  },
  horizontalProductCard: {
    marginRight: Spacing.md,
  },
  skeletonProduct: {
    width: 160,
    height: 220,
    backgroundColor: Colors.light.surfaceAlt,
    borderRadius: BorderRadius.xl,
  },
});
