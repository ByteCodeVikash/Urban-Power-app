import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Info } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { NetworkImage } from '../../components/NetworkImage';
import { Colors, Spacing, Shadows } from '../../constants/Theme';
import { useScrapItemDetails } from '../../hooks/useKabadi';
import { useScrapSelectionStore } from '../../store/useScrapSelectionStore';
import { RootStackParamList } from '../../navigation/Types';
import { ScrapQuantitySelector } from '../../components/ScrapQuantitySelector';

type ScrapItemDetailsRouteProp = RouteProp<
  RootStackParamList,
  'ScrapItemDetails'
>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

export default function ScrapItemDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScrapItemDetailsRouteProp>();
  const { itemId, itemTitle } = route.params;

  const { data: item, isLoading, error } = useScrapItemDetails(itemId);

  const selectedItems = useScrapSelectionStore(state => state.selectedItems);
  const addItem = useScrapSelectionStore(state => state.addItem);
  const updateQuantity = useScrapSelectionStore(state => state.updateQuantity);

  const currentSelection = selectedItems.find(i => i.id === itemId);
  const qty = currentSelection ? currentSelection.quantity : 0;

  const handleIncrement = () => {
    if (item) {
      if (qty === 0) {
        addItem(item, 1);
      } else {
        updateQuantity(item.id, 1);
      }
    }
  };

  const handleDecrement = () => {
    if (item && qty > 0) {
      updateQuantity(item.id, -1);
    }
  };

  const handleQuantityChange = (newQty: number) => {
    if (item) {
      const delta = newQty - qty;
      if (delta !== 0) {
        updateQuantity(item.id, delta);
      }
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
            {itemTitle}
          </Typography>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !item) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft color={Colors.light.text} size={24} />
          </Pressable>
          <Typography variant="h3" weight="700">
            {itemTitle}
          </Typography>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.centered}>
          <Typography variant="body1" color={Colors.light.textSecondary}>
            Failed to load item details.
          </Typography>
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
          Details
        </Typography>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.imageContainer}>
          {item.image ? (
            <NetworkImage
              source={{ uri: item.image }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.fallbackImage}>
              <Typography variant="h1" color={Colors.light.primary}>
                {item.name.charAt(0)}
              </Typography>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.titlePriceRow}>
            <Typography
              variant="h2"
              weight="800"
              color={Colors.light.text}
              style={styles.title}
            >
              {item.name}
            </Typography>
            <Typography variant="h2" weight="800" color={Colors.light.primary}>
              ₹{item.price_per_kg}/kg
            </Typography>
          </View>

          <Typography
            variant="body1"
            color={Colors.light.textSecondary}
            style={styles.description}
          >
            {item.description ||
              'No description available for this scrap item.'}
          </Typography>

          <View style={styles.divider} />

          <View style={styles.instructionsContainer}>
            <View style={styles.instructionRow}>
              <Info size={20} color={Colors.light.primary} />
              <Typography
                variant="body2"
                color={Colors.light.text}
                style={styles.instructionText}
              >
                Please ensure scrap is segregated and free of non-recyclable
                waste.
              </Typography>
            </View>
            <View style={styles.instructionRow}>
              <Info size={20} color={Colors.light.primary} />
              <Typography
                variant="body2"
                color={Colors.light.text}
                style={styles.instructionText}
              >
                Weighing is done at your doorstep using certified digital
                scales.
              </Typography>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionFooter}>
        {qty === 0 ? (
          <Pressable style={styles.primaryAddBtn} onPress={handleIncrement}>
            <Typography variant="body1" color={Colors.light.white} weight="700">
              Add to Selection
            </Typography>
          </Pressable>
        ) : (
          <ScrapQuantitySelector
            quantity={qty}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onChange={handleQuantityChange}
            size="lg"
          />
        )}
      </View>
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
  imageContainer: {
    width: width,
    height: 250,
    backgroundColor: Colors.light.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallbackImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    padding: Spacing.lg,
  },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  title: {
    flex: 1,
    marginRight: Spacing.md,
  },
  description: {
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginVertical: Spacing.lg,
  },
  instructionsContainer: {
    gap: Spacing.md,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  instructionText: {
    flex: 1,
    lineHeight: 20,
  },
  actionFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    backgroundColor: Colors.light.white,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    ...Shadows.light.md,
  },
  primaryAddBtn: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerQtySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: 12,
    padding: 4,
    backgroundColor: Colors.light.surface,
  },
  footerQtyBtn: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerQtyText: {
    color: Colors.light.text,
  },
});
