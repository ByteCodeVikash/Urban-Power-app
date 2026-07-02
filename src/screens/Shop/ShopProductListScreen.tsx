import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { NetworkImage } from '../../components/NetworkImage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Plus, ShoppingCart } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { PRODUCTS } from '../../constants/MockData';
import { useCartStore } from '../../store/useCartStore';
import { Button } from '../../components/Button';

export default function ShopProductListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const addItem = useCartStore(state => state.addItem);
  const { categoryId, subcategoryName, categoryName } = route.params;

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Filter products by category AND subcategory
  const filteredProducts = PRODUCTS.filter(
    p => p.category === categoryName && p.subcategory === subcategoryName,
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={subcategoryName}
        leftComponent={
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity
            onPress={() => navigation.navigate('Cart')}
            style={styles.cartButton}
          >
            <ShoppingCart size={22} color={Colors.light.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerInfo}>
          <Typography variant="h3" weight="800">
            {subcategoryName}
          </Typography>
          <Typography variant="body2" color={Colors.light.textSecondary}>
            Explore {filteredProducts.length} items in {categoryName}
          </Typography>
        </View>

        {filteredProducts.length > 0 ? (
          <View style={styles.productGrid}>
            {filteredProducts.map(product => (
              <View key={product.id} style={styles.productCard}>
                <NetworkImage
                  source={{ uri: product.image }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <View style={styles.productInfo}>
                  <Typography
                    variant="body2"
                    weight="700"
                    numberOfLines={2}
                    style={styles.productTitle}
                  >
                    {product.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={Colors.light.textMuted}
                    numberOfLines={1}
                  >
                    {product.description}
                  </Typography>
                  <View style={styles.priceRow}>
                    <Typography
                      variant="h4"
                      weight="800"
                      color={Colors.light.primary}
                    >
                      ₹{product.price}
                    </Typography>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => {
                        setSelectedProduct(product);
                        setIsModalVisible(true);
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
            <Typography variant="body1" color={Colors.light.textMuted}>
              Coming Soon!
            </Typography>
            <Typography variant="caption" color={Colors.light.textMuted}>
              We are restockings items for {subcategoryName}.
            </Typography>
          </View>
        )}
      </ScrollView>

      {/* ── Buy Now Modal Bottom Sheet ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <Pressable
              style={styles.modalContent}
              onPress={e => e.stopPropagation()}
            >
              <View style={styles.dragHandle} />

              {selectedProduct && (
                <>
                  <View style={styles.modalProductRow}>
                    <NetworkImage
                      source={{ uri: selectedProduct.image }}
                      style={styles.modalProductImage}
                      resizeMode="cover"
                    />
                    <View style={styles.modalProductInfo}>
                      <Typography
                        variant="tiny"
                        color={Colors.light.primary}
                        weight="700"
                        style={{ textTransform: 'uppercase', marginBottom: 2 }}
                      >
                        {selectedProduct.category}
                      </Typography>
                      <Typography
                        variant="body1"
                        weight="800"
                        numberOfLines={2}
                      >
                        {selectedProduct.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color={Colors.light.textSecondary}
                        numberOfLines={2}
                        style={{ marginTop: 4 }}
                      >
                        {selectedProduct.description}
                      </Typography>
                    </View>
                  </View>

                  <View style={styles.modalPriceRow}>
                    <View>
                      <Typography
                        variant="caption"
                        color={Colors.light.textMuted}
                        weight="600"
                      >
                        Total Price
                      </Typography>
                      <Typography
                        variant="h2"
                        weight="900"
                        color={Colors.light.primary}
                      >
                        ₹{selectedProduct.price}
                      </Typography>
                    </View>
                    <View style={styles.modalBadge}>
                      <Typography variant="tiny" color="#10B981" weight="800">
                        In Stock
                      </Typography>
                    </View>
                  </View>

                  <Button
                    title="Buy Now"
                    onPress={() => {
                      addItem(selectedProduct);
                      setIsModalVisible(false);
                      navigation.navigate('Cart');
                    }}
                    style={styles.modalBuyButton}
                  />
                </>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: Colors.light.white,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    paddingBottom: Math.max(Spacing.xxl, 36),
    ...Shadows.light.lg,
    elevation: 24,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: Colors.light.border,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  modalProductRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  modalProductImage: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#F1F5F9',
  },
  modalProductInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  modalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  modalBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  modalBuyButton: {
    width: '100%',
  },
});
