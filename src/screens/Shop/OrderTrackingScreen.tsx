import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Package, Truck, Calendar, MapPin, ChevronRight, Check } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';

const TRACKING_STEPS = [
  { id: '1', title: 'Ordered', status: 'completed' },
  { id: '2', title: 'Packed', status: 'completed' },
  { id: '3', title: 'Shipped', status: 'active' },
  { id: '4', title: 'Delivery', status: 'pending' },
];

export default function OrderTrackingScreen() {
  const route = useRoute();
  const { orderId } = route.params as { orderId: string };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Order Tracking" showBack />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Estimated Header */}
        <View style={styles.estimatedCard}>
           <View style={styles.packageIcon}>
              <Package size={32} color={Colors.light.primary} />
           </View>
           <View style={{ flex: 1, marginLeft: Spacing.xl }}>
              <Typography variant="caption" color={Colors.light.textMuted} weight="700">ESTIMATED DELIVERY</Typography>
              <Typography variant="h2" weight="900" color={Colors.light.primary}>14 Oct, 2023</Typography>
              <Typography variant="body2" color={Colors.light.textSecondary}>Before 8:00 PM</Typography>
           </View>
        </View>

        {/* Progress Bar (Horizontal) */}
        <View style={styles.section}>
           <View style={styles.progressContainer}>
              {TRACKING_STEPS.map((step, index) => (
                <View key={step.id} style={styles.progressStep}>
                   <View style={styles.stepRail}>
                      {index !== 0 && <View style={[styles.line, step.status !== 'pending' && styles.lineActive]} />}
                      <View style={[
                        styles.stepDot, 
                        step.status === 'completed' && styles.dotCompleted,
                        step.status === 'active' && styles.dotActive
                      ]}>
                         {step.status === 'completed' && <Check size={12} color={Colors.light.white} />}
                      </View>
                   </View>
                   <Typography variant="tiny" weight="800" color={step.status === 'pending' ? Colors.light.textMuted : Colors.light.primary}>
                      {step.title}
                   </Typography>
                </View>
              ))}
           </View>
           
           <View style={styles.statusUpdate}>
              <Truck size={18} color={Colors.light.primary} />
              <Typography variant="body2" style={{ marginLeft: 12, flex: 1 }}>
                Order has reached [Bangalore North Hub] and is undergoing sorting.
              </Typography>
           </View>
        </View>

        {/* Order Details */}
        <View style={styles.section}>
           <Typography variant="h4" weight="800" style={{ marginBottom: Spacing.lg }}>Order Items</Typography>
           <View style={styles.itemRow}>
              <View style={styles.itemThumb}>
                 <Typography variant="h4" weight="800" color={Colors.light.primary}>P</Typography>
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                 <Typography variant="body1" weight="800">Professional Cleaning Kit</Typography>
                 <Typography variant="body2" color={Colors.light.textSecondary}>Qty: 1 • Seller: UrbanPower Retail</Typography>
              </View>
              <Typography variant="body1" weight="900">₹1,299</Typography>
           </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
           <Typography variant="h4" weight="800" style={{ marginBottom: Spacing.lg }}>Shipping Address</Typography>
           <View style={styles.addressBox}>
              <MapPin size={20} color={Colors.light.textMuted} />
              <Typography variant="body2" style={{ marginLeft: 12, flex: 1 }}>
                Vikash Kumar • 9876543210
                {"\n"}Flat 402, Green Valley Apartments, HSR Layout, Sector 2, Bangalore, 560102
              </Typography>
           </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
         <Button title="Need help with order?" variant="outline" style={{ flex: 1 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  content: { padding: Spacing.lg },
  estimatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xxl,
    marginBottom: Spacing.lg,
    ...Shadows.light.md,
  },
  packageIcon: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  section: {
    backgroundColor: Colors.light.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    ...Shadows.light.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xs,
  },
  progressStep: { alignItems: 'center', flex: 1 },
  stepRail: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepDot: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.light.border,
    justifyContent: 'center', alignItems: 'center',
    zIndex: 1,
  },
  dotCompleted: { backgroundColor: Colors.light.success },
  dotActive: { backgroundColor: Colors.light.primary, borderWidth: 3, borderColor: Colors.light.primaryLight },
  line: {
    position: 'absolute',
    right: '50%',
    width: '100%',
    height: 3,
    backgroundColor: Colors.light.border,
    zIndex: 0,
  },
  lineActive: { backgroundColor: Colors.light.success },
  statusUpdate: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4, borderLeftColor: Colors.light.primary,
  },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  itemThumb: {
    width: 48, height: 48, borderRadius: 8,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center', alignItems: 'center',
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: Spacing.xl,
    backgroundColor: Colors.light.white,
    flexDirection: 'row',
    borderTopWidth: 1, borderTopColor: Colors.light.borderLight,
    ...Shadows.light.lg,
  },
});
