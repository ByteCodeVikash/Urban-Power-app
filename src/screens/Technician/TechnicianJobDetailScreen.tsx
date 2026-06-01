import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Pressable, Linking } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MapPin, Phone, MessageSquare, Clock, ShieldCheck, CheckCircle2, Navigation, AlertCircle } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';

type JobStatus = 'Assigned' | 'In-Progress' | 'Completed';

export default function TechnicianJobDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { jobId } = route.params as { jobId: string };
  const [status, setStatus] = useState<JobStatus>('Assigned');

  const handleUpdateStatus = () => {
    if (status === 'Assigned') setStatus('In-Progress');
    else if (status === 'In-Progress') setStatus('Completed');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Job Execution" showBack />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Status Tracker */}
        <View style={styles.statusBanner}>
           <View style={[styles.statusBadge, { backgroundColor: status === 'Completed' ? Colors.light.success : Colors.light.primary }]}>
              <Typography variant="tiny" weight="900" color={Colors.light.white}>{status.toUpperCase()}</Typography>
           </View>
           <Typography variant="body2" weight="700" color={Colors.light.textSecondary}>ID: #JOB-{jobId}</Typography>
        </View>

        {/* Customer & Location */}
        <View style={styles.card}>
           <Typography variant="h4" weight="800" style={{ marginBottom: Spacing.md }}>Customer Details</Typography>
           <View style={styles.customerRow}>
              <View style={styles.avatar}><Typography weight="800" color={Colors.light.white}>VK</Typography></View>
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                 <Typography variant="body1" weight="800">Vikash Kumar</Typography>
                 <Typography variant="body2" color={Colors.light.textSecondary}>Deep Home Cleaning</Typography>
              </View>
              <View style={styles.actionIcons}>
                 <Pressable style={styles.iconBtn} onPress={() => Linking.openURL('tel:1234567890')}>
                    <Phone size={20} color={Colors.light.primary} />
                 </Pressable>
                 <Pressable style={styles.iconBtn}>
                    <MessageSquare size={20} color={Colors.light.primary} />
                 </Pressable>
              </View>
           </View>
           
           <View style={styles.addressBox}>
              <MapPin size={20} color={Colors.light.textMuted} />
              <Typography variant="body2" style={{ flex: 1, marginLeft: Spacing.md }}>
                Flat 402, Green Valley Apartments, HSR Layout Sector 2, Bangalore
              </Typography>
              <Pressable style={styles.navigateBtn}>
                 <Navigation size={18} color={Colors.light.white} />
              </Pressable>
           </View>
        </View>

        {/* Job Checklist */}
        <View style={styles.card}>
           <Typography variant="h4" weight="800" style={{ marginBottom: Spacing.md }}>Service Checklist</Typography>
           {[
             'Kitchen Deep Cleaning',
             'Bathroom Sanitization',
             'Dry Dusting of All Rooms',
             'Floor Scrubbing'
           ].map((item, index) => (
             <View key={index} style={styles.checkItem}>
                <CheckCircle2 size={18} color={Colors.light.success} />
                <Typography variant="body2" style={{ marginLeft: Spacing.md }}>{item}</Typography>
             </View>
           ))}
        </View>

        {/* Safety Banner */}
        <View style={styles.safetyCard}>
           <ShieldCheck size={24} color="#10B981" />
           <Typography variant="body2" color="#065F46" weight="700" style={{ flex: 1, marginLeft: Spacing.md }}>
             UC Safety: Ensure you are wearing your ID card and mask.
           </Typography>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.footer}>
         {status === 'Completed' ? (
           <Button title="Back to Dashboard" onPress={() => navigation.goBack()} style={{ flex: 1 }} />
         ) : (
           <>
             <Button 
               title="Report Issue" 
               variant="outline" 
               style={{ flex: 1, marginRight: Spacing.md, borderColor: Colors.light.danger }} 
               icon={<AlertCircle size={18} color={Colors.light.danger} />}
             />
             <Button 
               title={status === 'Assigned' ? 'START JOB' : 'MARK AS COMPLETED'} 
               onPress={handleUpdateStatus} 
               style={{ flex: 2 }} 
             />
           </>
         )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  content: { padding: Spacing.lg },
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  statusBadge: {
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  card: {
    backgroundColor: Colors.light.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    ...Shadows.light.sm,
  },
  customerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  actionIcons: { flexDirection: 'row', gap: Spacing.sm },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center', alignItems: 'center',
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  navigateBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center', alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: '#A7F3D0',
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
