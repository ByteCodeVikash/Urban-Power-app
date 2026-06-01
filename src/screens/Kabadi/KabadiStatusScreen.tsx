import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Pressable, Linking } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MapPin, Phone, MessageSquare, Clock, CheckCircle2, ChevronRight, Truck } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';

const STATUS_STEPS = [
  { title: 'Request Placed', subtitle: 'Awaiting partner assignment', status: 'completed', time: '10:30 AM' },
  { title: 'Partner Assigned', subtitle: 'Ramesh Kumar is on the way', status: 'active', time: '10:45 AM' },
  { title: 'Pickup in Progress', subtitle: 'Weighing & valuation', status: 'pending', time: '--:--' },
  { title: 'Completed', subtitle: 'Payment sent to wallet', status: 'pending', time: '--:--' },
];

export default function KabadiStatusScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { bookingId } = route.params as { bookingId: string };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Track Pickup" showBack />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Live ID & ETA */}
        <View style={styles.topInfo}>
          <View>
            <Typography variant="caption" color={Colors.light.textMuted}>ORDER ID</Typography>
            <Typography variant="body1" weight="800">#KB-{bookingId || '89231'}</Typography>
          </View>
          <View style={styles.etaBox}>
            <Clock size={16} color={Colors.light.primary} />
            <Typography variant="body1" weight="800" color={Colors.light.primary} style={{ marginLeft: 6 }}>
              15 MINS
            </Typography>
          </View>
        </View>

        {/* Status Timeline */}
        <View style={styles.section}>
          <Typography variant="h4" weight="800" style={{ marginBottom: Spacing.xl }}>Pickup Progress</Typography>
          
          {STATUS_STEPS.map((step, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={[
                  styles.dot, 
                  step.status === 'completed' && styles.dotCompleted,
                  step.status === 'active' && styles.dotActive
                ]}>
                  {step.status === 'completed' && <CheckCircle2 size={16} color={Colors.light.white} />}
                </View>
                {index !== STATUS_STEPS.length - 1 && (
                  <View style={[styles.line, step.status === 'completed' && styles.lineCompleted]} />
                )}
              </View>
              
              <View style={styles.timelineRight}>
                <View style={styles.stepHeader}>
                  <Typography variant="body1" weight="700" color={step.status === 'pending' ? Colors.light.textMuted : Colors.light.text}>
                    {step.title}
                  </Typography>
                  <Typography variant="caption" color={Colors.light.textMuted}>{step.time}</Typography>
                </View>
                <Typography variant="body2" color={Colors.light.textSecondary}>{step.subtitle}</Typography>
              </View>
            </View>
          ))}
        </View>

        {/* Partner Card */}
        <View style={styles.partnerCard}>
           <View style={styles.partnerInfo}>
              <View style={styles.avatar}>
                 <Typography variant="h3" weight="800" color={Colors.light.white}>RK</Typography>
              </View>
              <View style={styles.partnerText}>
                 <Typography variant="body1" weight="800">Ramesh Kumar</Typography>
                 <Typography variant="caption" color={Colors.light.textMuted}>4.9 ★ • 1200+ Pickups</Typography>
              </View>
           </View>
           <View style={styles.actionRow}>
              <Pressable style={styles.iconBtn} onPress={() => Linking.openURL('tel:1234567890')}>
                 <Phone size={20} color={Colors.light.primary} />
              </Pressable>
              <Pressable style={styles.iconBtn}>
                 <MessageSquare size={20} color={Colors.light.primary} />
              </Pressable>
           </View>
        </View>

        {/* Pickup Details */}
        <View style={styles.section}>
           <Typography variant="h4" weight="800" style={{ marginBottom: Spacing.lg }}>Pickup Details</Typography>
           <View style={styles.detailRow}>
              <MapPin size={18} color={Colors.light.textMuted} />
              <Typography variant="body2" style={{ marginLeft: 12, flex: 1 }}>
                Flat 402, Green Valley Apartments, HSR Layout, Sector 2, Bangalore
              </Typography>
           </View>
           <View style={[styles.detailRow, { marginTop: Spacing.md }]}>
              <Truck size={18} color={Colors.light.textMuted} />
              <Typography variant="body2" style={{ marginLeft: 12 }}>
                Category: Mixed (Plastic, Metal, E-Waste)
              </Typography>
           </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
         <Button title="Need help?" variant="outline" style={{ flex: 1, marginRight: Spacing.md }} />
         <Button title="Cancel Pickup" variant="danger" style={{ flex: 1 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  content: { padding: Spacing.lg },
  topInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    ...Shadows.light.sm,
  },
  etaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  section: {
    backgroundColor: Colors.light.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    ...Shadows.light.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 80,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 30,
    marginRight: Spacing.md,
  },
  dot: {
    width: 24, height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  dotCompleted: { backgroundColor: Colors.light.success },
  dotActive: { 
    backgroundColor: Colors.light.primary,
    borderWidth: 4,
    borderColor: Colors.light.primaryLight,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 4,
  },
  lineCompleted: { backgroundColor: Colors.light.success },
  timelineRight: { flex: 1, paddingBottom: Spacing.xl },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  partnerCard: {
    backgroundColor: Colors.light.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.light.sm,
  },
  partnerInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 50, height: 50,
    borderRadius: 25,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerText: { marginLeft: Spacing.md },
  actionRow: { flexDirection: 'row', gap: Spacing.sm },
  iconBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start' },
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: Spacing.xl,
    backgroundColor: Colors.light.white,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    ...Shadows.light.lg,
  },
});
