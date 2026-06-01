import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Pressable, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Minus, Plus, ShoppingCart, Tag } from 'lucide-react-native';
import { useCartStore } from '../../store/useCartStore';
import { Header } from '../../components/Header';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';

export default function CartScreen() {
  const navigation = useNavigation();
  const { items, addProduct, updateQuantity, totalPrice, totalItemsCount } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'UC50') {
      setDiscount(Math.round(totalPrice() * 0.5));
    } else if (couponCode.toUpperCase() === 'WELCOME') {
      setDiscount(100);
    } else {
      setDiscount(0);
    }
  };

  const handleCheckout = () => {
    // Dummy checkout success logic
    navigation.navigate('Main', { screen: 'Home' } as any);
    alert('Order placed successfully! Thank you for shopping with UrbanPower.');
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Your Cart" showBack />
        <View style={styles.emptyContainer}>
          <ShoppingCart color={Colors.light.border} size={80} />
          <Typography variant="h3" weight="600" style={{ marginTop: Spacing.xl }}>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color={Colors.light.textSecondary} style={{ marginTop: Spacing.sm, textAlign: 'center' }}>
            Looks like you haven't added any products yet.
          </Typography>
          <Button 
            title="Go to Shop" 
            onPress={() => navigation.goBack()} 
            style={{ marginTop: Spacing.xl }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const subtotal = totalPrice();
  const tax = Math.round((subtotal - discount) * 0.18);
  const total = subtotal - discount + tax;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Cart Summary" showBack />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Typography variant="h4" weight="700">Product List</Typography>
            <Typography variant="caption" color={Colors.light.textMuted}>{totalItemsCount()} Items</Typography>
          </View>
          {items.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <View style={styles.itemInfo}>
                <Typography variant="body1" weight="600">{item.title}</Typography>
                <Typography variant="h4" weight="800" color={Colors.light.primary} style={{ marginTop: 2 }}>₹{item.price}</Typography>
              </View>
              
              <View style={styles.quantityControl}>
                <Pressable onPress={() => updateQuantity(item.id, -1)} style={styles.qButton}>
                  <Minus color={Colors.light.text} size={14} />
                </Pressable>
                <Typography variant="body1" weight="700" style={{ marginHorizontal: Spacing.md }}>
                  {item.quantity}
                </Typography>
                <Pressable onPress={() => updateQuantity(item.id, 1)} style={styles.qButton}>
                  <Plus color={Colors.light.text} size={14} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Typography variant="h4" weight="700" style={styles.sectionTitle}>Coupons & Offers</Typography>
          <View style={styles.couponContainer}>
            <View style={styles.couponInputWrapper}>
              <Tag color={Colors.light.primary} size={18} />
              <TextInput
                style={styles.couponInput}
                placeholder="Enter coupon code (WELCOME)"
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
                placeholderTextColor={Colors.light.textMuted}
              />
            </View>
            <Pressable 
              onPress={applyCoupon} 
              disabled={!couponCode}
              style={[styles.applyBtn, !couponCode && { opacity: 0.5 }]}
            >
              <Typography variant="body2" weight="700" color={Colors.light.primary}>APPLY</Typography>
            </Pressable>
          </View>
          {discount > 0 && (
            <View style={styles.couponSuccess}>
               <Typography variant="tiny" color={Colors.light.success} weight="700">"UC50" applied! You saved ₹{discount}</Typography>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Typography variant="h4" weight="700" style={styles.sectionTitle}>Payment Summary</Typography>
          
          <View style={styles.row}>
            <Typography variant="body1" color={Colors.light.textSecondary}>Item Total</Typography>
            <Typography variant="body1" weight="600">₹{subtotal}</Typography>
          </View>
          {discount > 0 && (
            <View style={[styles.row, { marginTop: Spacing.md }]}>
              <Typography variant="body1" color={Colors.light.success}>Coupon Discount</Typography>
              <Typography variant="body1" color={Colors.light.success} weight="600">-₹{discount}</Typography>
            </View>
          )}
          <View style={[styles.row, { marginTop: Spacing.md }]}>
            <Typography variant="body1" color={Colors.light.textSecondary}>Convenience Fee & Taxes</Typography>
            <Typography variant="body1" weight="600">₹{tax}</Typography>
          </View>
          
          <View style={styles.totalRow}>
            <View>
              <Typography variant="h4" weight="800">Total Amount</Typography>
              <Typography variant="tiny" color={Colors.light.textMuted}>Incl. all taxes</Typography>
            </View>
            <Typography variant="h3" weight="900">₹{total}</Typography>
          </View>
        </View>
        
        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <Typography variant="h3" weight="800">₹{total}</Typography>
          <Typography variant="tiny" color={Colors.light.primary} weight="700">VIEW BREAKUP</Typography>
        </View>
        <Button 
          title="Proceed to Checkout" 
          onPress={handleCheckout} 
          size="lg" 
          style={{ flex: 1, marginLeft: Spacing.lg }} 
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  container: { flex: 1 },
  section: {
    backgroundColor: Colors.light.white,
    marginTop: Spacing.sm,
    padding: Spacing.xl,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: { marginBottom: Spacing.lg },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  itemInfo: { flex: 1, paddingRight: Spacing.md },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.primaryLight,
  },
  qButton: { padding: Spacing.sm },
  couponContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  couponInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    height: 48,
    marginRight: Spacing.md,
  },
  couponInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  applyBtn: {
    paddingHorizontal: Spacing.md,
  },
  couponSuccess: {
    backgroundColor: '#ECFDF5',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  divider: { height: 1, backgroundColor: Colors.light.border, marginVertical: Spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 2,
    borderTopColor: Colors.light.surface,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.white,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    ...Shadows.light.md,
  },
  footerPrice: {
    justifyContent: 'center',
  },
});
