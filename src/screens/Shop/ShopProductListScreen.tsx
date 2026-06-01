import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Pressable, TouchableOpacity } from 'react-native';
import { NetworkImage } from '../../components/NetworkImage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Plus, ShoppingCart } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { PRODUCTS } from '../../constants/MockData';
import { useCartStore } from '../../store/useCartStore';

export default function ShopProductListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const addItem = useCartStore((state) => state.addItem);
  const { categoryId, subcategoryName, categoryName } = route.params;

  // Filter products by category AND subcategory
  const filteredProducts = PRODUCTS.filter(p => 
    p.category === categoryName && p.subcategory === subcategoryName
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header 
        title={subcategoryName} 
        leftComponent={
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
        }
        rightComponent={
           <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartButton}>
             <ShoppingCart size={22} color={Colors.light.text} />
           </TouchableOpacity>
        }
      />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.headerInfo}>
           <Typography variant="h3" weight="800">{subcategoryName}</Typography>
           <Typography variant="body2" color={Colors.light.textSecondary}>
             Explore {filteredProducts.length} items in {categoryName}
           </Typography>
        </View>

        {filteredProducts.length > 0 ? (
          <View style={styles.productGrid}>
            {filteredProducts.map((product) => (
              <View key={product.id} style={styles.productCard}>
                <NetworkImage 
                  source={{ uri: product.image }} 
                  style={styles.productImage} 
                  resizeMode="cover"
                />
                <View style={styles.productInfo}>
                  <Typography variant="body2" weight="700" numberOfLines={2} style={styles.productTitle}>
                    {product.title}
                  </Typography>
                  <Typography variant="caption" color={Colors.light.textMuted} numberOfLines={1}>
                    {product.description}
                  </Typography>
                  <View style={styles.priceRow}>
                    <Typography variant="h4" weight="800" color={Colors.light.primary}>
                      ₹{product.price}
                    </Typography>
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={() => {
                        addItem(product);
                        alert('Added to cart');
                      }}
                    >
                      <Plus size={18} color={Colors.light.white} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
             <Typography variant="body1" color={Colors.light.textMuted}>Coming Soon!</Typography>
             <Typography variant="caption" color={Colors.light.textMuted}>We are restockings items for {subcategoryName}.</Typography>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  content: { padding: Spacing.md, paddingBottom: 100 },
  backButton: { padding: 4 },
  cartButton: { padding: 4 },
  headerInfo: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    ...Shadows.light.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  productImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#F1F5F9',
  },
  productInfo: {
    padding: Spacing.md,
  },
  productTitle: {
    height: 36,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.light.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    gap: 8,
  },
});
