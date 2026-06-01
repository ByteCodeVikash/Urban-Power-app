import React from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { ProductCard } from '../../components/ProductCard';
import { Colors, Spacing, Shadows, BorderRadius } from '../../constants/Theme';
import { PRODUCTS } from '../../constants/MockData';
import { useCartStore } from '../../store/useCartStore';

const { width } = Dimensions.get('window');

export default function ProductListScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { categoryId, categoryName, subcategoryName } = route.params || { categoryName: 'Products' };
  const addProduct = useCartStore(state => state.addProduct);

  // Mock filtering: just show some products and label them with the subcategory
  const displayProducts = PRODUCTS.map(p => ({
    ...p,
    title: `${subcategoryName || categoryName} ${p.title.split(' ').pop()}`
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={subcategoryName || categoryName} showBack showCart />
      
      <FlatList
        data={displayProducts}
        numColumns={2}
        keyExtractor={(item) => item.id + (subcategoryName || '')}
        renderItem={({ item }) => (
          <ProductCard 
            product={item}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id, productTitle: item.title })}
            onAddPress={() => addProduct(item)}
            style={styles.productCard}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
           <View style={styles.headerInfo}>
              <Typography variant="h3" weight="800">
                Best of {subcategoryName || categoryName}
              </Typography>
              <Typography variant="body2" color={Colors.light.textSecondary} style={{ marginTop: 4 }}>
                Premium quality items with express delivery.
              </Typography>
           </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Typography variant="body1" color={Colors.light.textMuted}>
              No products found in this category.
            </Typography>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.white },
  listContent: { padding: Spacing.md, paddingBottom: 150 },
  headerInfo: { marginBottom: Spacing.xl, paddingHorizontal: Spacing.xs },
  productCard: {
    flex: 1,
    margin: Spacing.xs,
    maxWidth: (width / 2) - Spacing.lg,
  },
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
});
