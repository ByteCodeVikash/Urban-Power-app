import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Pressable, Linking } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MapPin, Phone, MessageSquare, Clock, CheckCircle2, Navigation, Star } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';

const STATUS_STEPS = [
  { title: 'Booking Confirmed', subtitle: 'Service scheduled for 4:00 PM', status: 'completed', time: '12:30 PM' },
  { title: 'Partner Assigned', subtitle: 'Vikram Singh is your professional', status: 'completed', time: '01:45 PM' },
  { title: 'In Transit', subtitle: 'Partner is arriving at your location', status: 'active', time: '03:15 PM' },
  { title: 'Service in Progress', subtitle: 'Work started', status: 'pending', time: '--:--' },
];

export default function ServiceTrackingScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { bookingId } = route.params as { bookingId: string };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Service Tracking" showBack />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Live Status Header */}
        <View style={styles.statusHeader}>
           <View style={styles.statusIcon}>
              <Navigation size={24} color={Colors.light.white} />
           </View>
           <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Typography variant="body2" color={Colors.light.textSecondary} weight="600">ID: #SRV-{bookingId}</Typography>
              <Typography variant="h3" weight="800">Partner is Nearby</Typography>
           </View>
           <View style={styles.etaBadge}>
              <Typography variant="h4" weight="900" color={Colors.light.primary}>8</Typography>
              <Typography variant="tiny" weight="700" color={Colors.light.primary}>MINS</Typography>
           </View>
        </View>

        {/* Action Card */}
        <View style={styles.partnerCard}>
           <View style={styles.partnerInfo}>
              <View style={styles.avatar}>
                 <Typography variant="h3" weight="800" color={Colors.light.white}>VS</Typography>
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                 <Typography variant="body1" weight="800">Vikram Singh</Typography>
                 <View style={styles.ratingRow}>
                    <Star size={14} color="#F59E0B" fill="#F59E0B" />
                    <Typography variant="body2" weight="700" style={{ marginLeft: 4 }}>4.9</Typography>
                    <Typography variant="caption" color={Colors.light.textMuted} style={{ marginLeft: 8 }}>200+ Jobs</Typography>
                 </View>
              </View>
              <View style={styles.actionIcons}>
                 <Pressable style={styles.iconBtn} onPress={() => Linking.openURL('tel:9876543210')}>
                    <Phone size={20} color={Colors.light.primary} />
                 </Pressable>
                 <Pressable style={styles.iconBtn}>
                    <MessageSquare size={20} color={Colors.light.primary} />
                 </Pressable>
              </View>
           </View>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
           <Typography variant="h4" weight="800" style={{ marginBottom: Spacing.xl }}>Journey</Typography>
           {STATUS_STEPS.map((step, index) => (
             <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                   <View style={[
                      styles.dot, 
                      step.status === 'completed' && { backgroundColor: Colors.light.success },
                      step.status === 'active' && { backgroundColor: Colors.light.primary, borderWidth: 4, borderColor: Colors.light.primaryLight }
                   ]}>
                      {step.status === 'completed' && <CheckCircle2 size={16} color={Colors.light.white} />}
                   </View>
                   {index !== STATUS_STEPS.length - 1 && (
                      <View style={[styles.line, step.status === 'completed' && { backgroundColor: Colors.light.success }]} />
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

        {/* Summary Card */}
        <View style={styles.section}>
           <Typography variant="h4" weight="800" style={{ marginBottom: Spacing.lg }}>Service Summary</Typography>
           <View style={styles.summaryRow}>
              <View style={styles.summaryIcon}><Typography weight="800">C</Typography></View>
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                 <Typography variant="body1" weight="800">Sofa Deep Cleaning</Typography>
                 <Typography variant="body2" color={Colors.light.textSecondary}>3-Seater • Handheld machine</Typography>
              </View>
              <Typography variant="body2" weight="800">₹899</Typography>
           </View>
           <View style={styles.addressBox}>
              <MapPin size={18} color={Colors.light.textMuted} />
              <Typography variant="body2" style={{ marginLeft: 12, flex: 1 }}>
                Flat 402, Green Valley Apartments, HSR Layout, Sector 2, Bangalore
              </Typography>
           </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
         <Button title="Need help?" variant="outline" style={{ flex: 1, marginRight: Spacing.md }} />
         <Button title="Reschedule" style={{ flex: 1 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.white },
  content: { padding: Spacing.lg },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    ...Shadows.light.md,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  statusIcon: {
    width: 48, height: 48, borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  etaBadge: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.light.primary,
  },
  partnerCard: {
    backgroundColor: Colors.light.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    ...Shadows.light.sm,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  partnerInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center', alignItems: 'center',
    ...Shadows.light.md,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  actionIcons: { flexDirection: 'row', gap: Spacing.md },
  iconBtn: {
    width: 44, height: 44, borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.light.borderLight,
  },
  section: {
    backgroundColor: Colors.light.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    ...Shadows.light.xs,
    borderWidth: 1, borderColor: Colors.light.borderLight,
  },
  timelineItem: { flexDirection: 'row', minHeight: 80 },
  timelineLeft: { alignItems: 'center', width: 32, marginRight: Spacing.lg },
  dot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.light.borderLight,
    justifyContent: 'center', alignItems: 'center',
    zIndex: 2,
  },
  line: { width: 3, flex: 1, backgroundColor: Colors.light.borderLight, marginVertical: -4, zIndex: 1 },
  timelineRight: { flex: 1, paddingBottom: Spacing.xl },
  stepHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl },
  summaryIcon: {
    width: 44, height: 44, borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.light.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
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
