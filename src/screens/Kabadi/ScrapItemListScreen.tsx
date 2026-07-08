import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { NetworkImage } from '../../components/NetworkImage';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { useScrapCategories } from '../../hooks/useKabadi';
import { useScrapSelectionStore } from '../../store/useScrapSelectionStore';
import { RootStackParamList } from '../../navigation/Types';
import { ScrapQuantitySelector } from '../../components/ScrapQuantitySelector';

type ScrapItemListRouteProp = RouteProp<RootStackParamList, 'ScrapItemList'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ScrapItemListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScrapItemListRouteProp>();
  const { categoryId, categoryName } = route.params;

  const { data: categories, isLoading } = useScrapCategories();

  // Zustand store properties
  const selectedItems = useScrapSelectionStore(state => state.selectedItems);
  const addItem = useScrapSelectionStore(state => state.addItem);
  const updateQuantity = useScrapSelectionStore(state => state.updateQuantity);
  const totalWeight = useScrapSelectionStore(state => state.totalWeight)();
  const totalEstimatedPrice = useScrapSelectionStore(
    state => state.totalEstimatedPrice,
  )();
  const clearSelection = useScrapSelectionStore(state => state.clearSelection);

  // Find the selected category and its items
  const category = categories?.find((c: any) => c.id === categoryId);
  const items = category?.items || [];

  const getItemQuantity = (itemId: string) => {
    const item = selectedItems.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  };

  const handleIncrement = (item: any) => {
    const currentQty = getItemQuantity(item.id);
    if (currentQty === 0) {
      addItem(item, 1);
    } else {
      updateQuantity(item.id, 1);
    }
  };

  const handleDecrement = (itemId: string) => {
    updateQuantity(itemId, -1);
  };

  const handleQuantityChange = (item: any, newQty: number) => {
    const currentQty = getItemQuantity(item.id);
    const delta = newQty - currentQty;
    if (delta !== 0) {
      updateQuantity(item.id, delta);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft color={Colors.light.text} size={24} />
          </Pressable>
          <Typography variant="h3" weight="700">
            {categoryName}
          </Typography>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color={Colors.light.text} size={24} />
        </Pressable>
        <Typography variant="h3" weight="700">
          {categoryName}
        </Typography>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {category?.image && (
          <View style={styles.bannerContainer}>
            <NetworkImage
              source={{ uri: category.image }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
            <View style={styles.bannerOverlay}>
              <Typography
                variant="body2"
                color={Colors.light.white}
                style={styles.bannerDesc}
              >
                {category.description ||
                  `Sell your ${categoryName} at best market rates.`}
              </Typography>
            </View>
          </View>
        )}

        <View style={styles.listContainer}>
          {items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Typography variant="body1" color={Colors.light.textSecondary}>
                No items available in this category.
              </Typography>
            </View>
          ) : (
            items.map((item: any) => {
              const qty = getItemQuantity(item.id);
              return (
                <Pressable
                  key={item.id}
                  style={styles.itemCard}
                  onPress={() =>
                    navigation.navigate('ScrapItemDetails', {
                      itemId: item.id,
                      itemTitle: item.name,
                    })
                  }
                >
                  <View style={styles.itemInfoSection}>
                    {item.image ? (
                      <NetworkImage
                        source={{ uri: item.image }}
                        style={styles.itemImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.itemFallbackImage}>
                        <Typography
                          variant="body2"
                          color={Colors.light.primary}
                          weight="700"
                        >
                          {item.name.charAt(0)}
                        </Typography>
                      </View>
                    )}
                    <View style={styles.itemDetails}>
                      <Typography
                        variant="body1"
                        weight="700"
                        color={Colors.light.text}
                      >
                        {item.name}
                      </Typography>
                      {item.description && (
                        <Typography
                          variant="caption"
                          color={Colors.light.textSecondary}
                          numberOfLines={2}
                        >
                          {item.description}
                        </Typography>
                      )}
                      <Typography
                        variant="body2"
                        weight="800"
                        color={Colors.light.primary}
                        style={styles.priceTag}
                      >
                        ₹{item.price_per_kg}/kg
                      </Typography>
                    </View>
                  </View>

                  <View
                    style={styles.actionContainer}
                    onStartShouldSetResponder={() => true}
                  >
                    {qty === 0 ? (
                      <Pressable
                        style={styles.addBtn}
                        onPress={() => handleIncrement(item)}
                      >
                        <Typography
                          variant="body2"
                          color={Colors.light.white}
                          weight="700"
                        >
                          Add
                        </Typography>
                      </Pressable>
                    ) : (
                      <ScrapQuantitySelector
                        quantity={qty}
                        onIncrement={() => handleIncrement(item)}
                        onDecrement={() => handleDecrement(item.id)}
                        onChange={newQty => handleQuantityChange(item, newQty)}
                        size="sm"
                      />
                    )}
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>

      {selectedItems.length > 0 && (
        <View style={styles.footerContainer}>
          <View style={styles.footerInfo}>
            <Typography variant="body2" weight="600" color={Colors.light.white}>
              {selectedItems.length} Item(s) Selected ({totalWeight} kg)
            </Typography>
            <Typography variant="caption" color={Colors.light.primaryLight}>
              Est. Value: ₹{totalEstimatedPrice}
            </Typography>
          </View>
          <View style={styles.footerActions}>
            <Pressable style={styles.clearBtn} onPress={clearSelection}>
              <Typography
                variant="body2"
                color={Colors.light.white}
                weight="700"
              >
                Clear
              </Typography>
            </Pressable>
            <Pressable
              style={styles.continueBtn}
              onPress={() => navigation.navigate('KabadiForm')}
            >
              <Typography
                variant="body2"
                color={Colors.light.primary}
                weight="700"
              >
                Continue
              </Typography>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.white },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { paddingBottom: 120 },
  bannerContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: Spacing.md,
  },
  bannerDesc: {
    color: Colors.light.white,
  },
  listContainer: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  itemCard: {
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  itemInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemFallbackImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  priceTag: {
    marginTop: Spacing.xs,
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  addBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: 8,
    padding: 2,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    paddingHorizontal: Spacing.xs,
    color: Colors.light.text,
  },
  footerContainer: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.light.primary,
    padding: Spacing.md,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.light.md,
  },
  footerInfo: {
    flexDirection: 'column',
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  clearBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
  },
  continueBtn: {
    backgroundColor: Colors.light.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
  },
});
