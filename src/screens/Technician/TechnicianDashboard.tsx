import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Pressable, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Briefcase, CreditCard, Star, Clock, MapPin, ChevronRight, Phone, Navigation, Bell, ChevronLeft } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/Types';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';

import { useBookingStore } from '../../store/useBookingStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TechnicianDashboard() {
  const navigation = useNavigation<NavigationProp>();
  const [isOnline, setIsOnline] = useState(true);
  const { bookings } = useBookingStore();

  // For demo, show all bookings as "Jobs"
  const jobs = bookings;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
         <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color={Colors.light.text} />
         </Pressable>
         <Typography variant="h3" weight="800">Partner Hub</Typography>
         <Pressable 
            onPress={() => setIsOnline(!isOnline)} 
            style={[styles.statusToggle, isOnline ? styles.online : styles.offline]}
         >
            <View style={[styles.toggleDot, isOnline ? { marginLeft: 'auto' } : { marginRight: 'auto' }]} />
            <Typography variant="tiny" weight="700" color={Colors.light.white} style={{ marginHorizontal: 8 }}>
               {isOnline ? 'ONLINE' : 'OFFLINE'}
            </Typography>
         </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Earnings Summary Card */}
        <Pressable 
            style={styles.earningsCard}
            onPress={() => navigation.navigate('TechnicianEarnings')}
        >
           <View style={{ flex: 1 }}>
              <Typography variant="caption" color="rgba(255,255,255,0.8)" weight="600">Today's Earnings</Typography>
              <Typography variant="h1" color={Colors.light.white} weight="900">₹2,450</Typography>
           </View>
           <View style={styles.earningStats}>
              <View style={styles.ratingBadge}>
                 <Star size={12} color="#F59E0B" fill="#F59E0B" />
                 <Typography variant="body2" color={Colors.light.white} weight="800" style={{ marginLeft: 4 }}>4.9</Typography>
              </View>
              <Typography variant="tiny" color="rgba(255,255,255,0.7)" style={{ marginTop: 4 }}>View Details</Typography>
           </View>
        </Pressable>

        {/* New Job Requests Section */}
        <View style={styles.sectionHeader}>
           <Typography variant="h4" weight="800">Service Requests</Typography>
           <View style={styles.notifBadge}>
              <Bell size={14} color={Colors.light.primary} />
              <Typography variant="tiny" color={Colors.light.primary} weight="800" style={{ marginLeft: 4 }}>2 NEW</Typography>
           </View>
        </View>

        {jobs.map((job) => (
          <Pressable 
            key={job.id} 
            style={styles.jobCard}
            onPress={() => navigation.navigate('TechnicianJobDetail', { jobId: job.id })}
          >
            <View style={styles.jobHeaderRow}>
               <View style={[styles.typeBadge, job.status === 'Pending' ? styles.newBadge : styles.upcomingBadge]}>
                  <Typography variant="tiny" weight="800" color={job.status === 'Pending' ? Colors.light.danger : Colors.light.primary}>
                    {job.status.toUpperCase()}
                  </Typography>
               </View>
               <Typography variant="body2" weight="900" color={Colors.light.text}>₹{job.price}</Typography>
            </View>

            <Typography variant="h4" weight="800" style={{ marginTop: Spacing.sm }}>{job.title}</Typography>
            
            <View style={styles.jobDetailRow}>
               <MapPin size={14} color={Colors.light.textMuted} />
               <Typography variant="caption" color={Colors.light.textSecondary} style={{ marginLeft: 6 }}>{job.address}</Typography>
            </View>

            <View style={styles.cardActions}>
               {job.status === 'New Request' ? (
                 <>
                   <Pressable style={[styles.actionBtn, styles.rejectBtn]}>
                      <Typography variant="body2" weight="700" color={Colors.light.danger}>Reject</Typography>
                   </Pressable>
                   <Pressable style={[styles.actionBtn, styles.acceptBtn]}>
                      <Typography variant="body2" weight="700" color={Colors.light.white}>Accept & Details</Typography>
                   </Pressable>
                 </>
               ) : (
                 <Pressable style={styles.startBtn} onPress={() => navigation.navigate('TechnicianJobDetail', { jobId: job.id })}>
                    <Typography variant="body2" weight="800" color={Colors.light.white}>VIEW JOB HUB</Typography>
                    <ChevronRight size={18} color={Colors.light.white} />
                 </Pressable>
               )}
            </View>
          </Pressable>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.white },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 40,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.light.white,
    ...Shadows.light.sm,
    zIndex: 10,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  statusToggle: {
    width: 106, height: 34,
    borderRadius: BorderRadius.full,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 4,
    ...Shadows.light.sm,
  },
  online: { backgroundColor: Colors.light.success },
  offline: { backgroundColor: Colors.light.textMuted },
  toggleDot: { 
    width: 26, height: 26, 
    borderRadius: 13, 
    backgroundColor: Colors.light.white,
    ...Shadows.light.xs 
  },
  content: { padding: Spacing.lg },
  earningsCard: {
    backgroundColor: '#1E1B4B', // Deep Indigo
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
    ...Shadows.light.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  earningStats: { alignItems: 'flex-end' },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  notifBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  jobCard: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: Colors.light.borderLight,
    ...Shadows.light.md,
  },
  jobHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: BorderRadius.sm },
  newBadge: { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FECACA' },
  upcomingBadge: { backgroundColor: Colors.light.primaryLight, borderWidth: 1, borderColor: Colors.light.primary },
  jobDetailRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md },
  cardActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl },
  actionBtn: { flex: 1, height: 48, borderRadius: BorderRadius.lg, justifyContent: 'center', alignItems: 'center' },
  rejectBtn: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  acceptBtn: { backgroundColor: Colors.light.primary, ...Shadows.light.sm },
  startBtn: { 
    flex: 1, height: 48, 
    backgroundColor: Colors.light.primary, 
    borderRadius: BorderRadius.lg, 
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    ...Shadows.light.sm
  },
});
