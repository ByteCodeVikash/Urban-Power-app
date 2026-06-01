import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Pressable, Dimensions } from 'react-native';
import { NetworkImage } from '../../components/NetworkImage';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ShoppingBag, ChevronLeft, Star, Heart, Share2, ShieldCheck, Truck } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { ProductCard } from '../../components/ProductCard';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { PRODUCTS } from '../../constants/MockData';

import { useCartStore } from '../../store/useCartStore';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { productId } = route.params;
  const product = PRODUCTS.find(p => p.id === productId) || PRODUCTS[0];

  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = () => {
    // Add multiple times based on quantity selected
    for(let i=0; i<quantity; i++) {
      addItem(product, 'product');
    }
    // Optionally navigate to cart or show success
    // navigation.navigate('Cart');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color={Colors.light.text} size={24} />
        </Pressable>
        <View style={styles.headerRight}>
          <Pressable style={styles.iconBtn}><Share2 color={Colors.light.text} size={20} /></Pressable>
          <Pressable style={styles.iconBtn}><Heart color={Colors.light.text} size={20} /></Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <NetworkImage source={{ uri: product.image }} style={styles.mainImage} resizeMode="cover" />
        
        <View style={styles.content}>
          <View style={styles.categoryRow}>
             <Typography variant="body2" color={Colors.light.primary} weight="700">
                {product.category.toUpperCase()}
             </Typography>
             <View style={styles.ratingBox}>
                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                <Typography variant="body2" weight="700" style={{ marginLeft: 4 }}>4.8</Typography>
                <Typography variant="caption" color={Colors.light.textMuted}> (1.2k reviews)</Typography>
             </View>
          </View>

          <Typography variant="h2" weight="700" style={styles.title}>{product.title}</Typography>
          
          <View style={styles.priceSection}>
            <Typography variant="h1" weight="800">₹{product.price}</Typography>
            <Typography variant="body1" color={Colors.light.textMuted} style={styles.mrp}>₹{Math.round(product.price * 1.2)}</Typography>
            <View style={styles.offBadge}>
               <Typography variant="tiny" weight="700" color={Colors.light.white}>20% OFF</Typography>
            </View>
          </View>

          <View style={styles.divider} />

          <Typography variant="h3" weight="700">Product Description</Typography>
          <Typography variant="body1" color={Colors.light.textSecondary} style={styles.description}>
             {product.description || 'This high-quality product is designed to meet your home care needs with professional efficiency. Part of our curated Urban Shop collection.'}
          </Typography>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <ShieldCheck size={24} color={Colors.light.success} />
              <View style={{ marginLeft: Spacing.sm }}>
                <Typography variant="body2" weight="700">Quality Assured</Typography>
                <Typography variant="tiny" color={Colors.light.textMuted}>100% Genuine</Typography>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Truck size={24} color={Colors.light.primary} />
              <View style={{ marginLeft: Spacing.sm }}>
                <Typography variant="body2" weight="700">Fast Delivery</Typography>
                <Typography variant="tiny" color={Colors.light.textMuted}>Within 2-3 Days</Typography>
              </View>
            </View>
          </View>

          <View style={styles.divider} />
          
          <Typography variant="h3" weight="700">Customer Reviews</Typography>
          <View style={styles.fakeReview}>
             <View style={styles.avatarPlaceholder} />
             <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Typography variant="body2" weight="700">Rahul M.</Typography>
                <Typography variant="caption" color={Colors.light.textMuted}>"Amazing quality, worth every penny!"</Typography>
             </View>
          </View>

          <View style={styles.similarSection}>
             <Typography variant="h3" weight="700" style={{ marginBottom: Spacing.md }}>Similar Products</Typography>
             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {PRODUCTS.filter(p => p.id !== product.id).map(p => (
                  <ProductCard 
                    key={p.id} 
                    product={p} 
                    style={{ marginRight: Spacing.md, width: 150 }}
                    onPress={() => navigation.navigate('ProductDetail', { productId: p.id, productTitle: p.title })}
                    onAddPress={() => addItem(p, 'product')}
                  />
                ))}
             </ScrollView>
          </View>
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.quantityPicker}>
           <Pressable style={styles.qtyBtn} onPress={() => quantity > 1 && setQuantity(quantity - 1)}>
             <Typography variant="h3" weight="700">-</Typography>
           </Pressable>
           <Typography variant="h4" weight="700" style={{ width: 30, textAlign: 'center' }}>{quantity}</Typography>
           <Pressable style={styles.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
             <Typography variant="h3" weight="700">+</Typography>
           </Pressable>
        </View>
        <Button 
          title="Add to Cart" 
          onPress={handleAddToCart} 
          style={{ flex: 1, marginLeft: Spacing.lg }} 
          icon={<ShoppingBag size={20} color={Colors.light.white} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    position: 'absolute',
    top: 40, left: 0, right: 0,
    zIndex: 10,
  },
  headerRight: { flexDirection: 'row', gap: Spacing.sm },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center', alignItems: 'center',
    ...Shadows.light.sm,
  },
  mainImage: {
    width: width,
    height: width * 1.1,
    backgroundColor: Colors.light.surface,
  },
  content: {
    padding: Spacing.xl,
    backgroundColor: Colors.light.white,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    marginTop: -30,
    ...Shadows.light.md,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  title: {
    marginBottom: Spacing.md,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  mrp: {
    textDecorationLine: 'line-through',
  },
  offBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginVertical: Spacing.xl,
  },
  description: {
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: Spacing.xl,
    gap: Spacing.lg,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  fakeReview: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
  },
  avatarPlaceholder: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.light.primaryLight,
  },
  similarSection: {
    marginTop: Spacing.xxl,
  },
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.light.white,
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    ...Shadows.light.lg,
  },
  quantityPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: 2,
  },
  qtyBtn: {
    width: 40, height: 40,
    justifyContent: 'center', alignItems: 'center',
  },
});
