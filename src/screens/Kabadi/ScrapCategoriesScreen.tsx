import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/Types';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { NetworkImage } from '../../components/NetworkImage';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { useScrapCategories } from '../../hooks/useKabadi';
import { useScrapSelectionStore } from '../../store/useScrapSelectionStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ScrapCategoriesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { data: categories, isLoading, error } = useScrapCategories();

  const selectedItems = useScrapSelectionStore(state => state.selectedItems);
  const totalWeight = useScrapSelectionStore(state => state.totalWeight)();
  const totalEstimatedPrice = useScrapSelectionStore(
    state => state.totalEstimatedPrice,
  )();
  const clearSelection = useScrapSelectionStore(state => state.clearSelection);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Sell Scrap (Kabadi)" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !categories) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Sell Scrap (Kabadi)" />
        <View style={styles.centered}>
          <Typography variant="body1" color={Colors.light.textSecondary}>
            Failed to load scrap categories.
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Sell Scrap (Kabadi)" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.categoryGrid}>
          {categories.map((item: any) => (
            <Pressable
              key={item.id}
              style={styles.categoryCard}
              onPress={() =>
                navigation.navigate('ScrapItemList', {
                  categoryId: item.id,
                  categoryName: item.name,
                })
              }
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
                    <Typography variant="h2" color={Colors.light.primary}>
                      {item.name.charAt(0)}
                    </Typography>
                  </View>
                )}
              </View>
              <Typography
                variant="body2"
                weight="700"
                style={styles.categoryTitle}
                numberOfLines={2}
              >
                {item.name}
              </Typography>
            </Pressable>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Typography
            variant="body2"
            color={Colors.light.textSecondary}
            style={{ textAlign: 'center' }}
          >
            Select a category to see items and prices. We pick up at your
            doorstep with digital weighing.
          </Typography>
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
          <Pressable style={styles.clearBtn} onPress={clearSelection}>
            <Typography
              variant="body2"
              color={Colors.light.primary}
              weight="700"
            >
              Clear
            </Typography>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: Spacing.md, paddingBottom: 120 },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: Colors.light.white,
    borderRadius: 16,
    overflow: 'hidden',
    ...Shadows.light.sm,
    marginBottom: Spacing.sm,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  fallbackImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    textAlign: 'center',
    color: Colors.light.text,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  infoBox: {
    marginTop: Spacing.xl,
    padding: Spacing.xl,
    backgroundColor: Colors.light.primaryLight,
    borderRadius: BorderRadius.xl,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Colors.light.primary,
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
  clearBtn: {
    backgroundColor: Colors.light.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
});
