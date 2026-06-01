import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CheckCircle2, Calendar, Clock, MapPin, ArrowRight } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';

export default function GeneralBookingSuccessScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { title, date, address } = route.params || { 
    title: 'Service Booking', 
    date: 'Scheduled', 
    address: 'Your Address' 
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.successHeader}>
          <View style={styles.checkWrapper}>
            <CheckCircle2 size={60} color={Colors.light.white} />
          </View>
          <Typography variant="h1" weight="900" style={{ marginTop: Spacing.xl }}>Booking Confirmed!</Typography>
          <Typography variant="body1" color={Colors.light.textSecondary} align="center" style={styles.subtitle}>
            Your professional is on the way to provide the best service experience.
          </Typography>
        </View>

        <View style={styles.detailsCard}>
          <Typography variant="h4" weight="800" style={{ marginBottom: Spacing.lg }}>Service Summary</Typography>
          
          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
              <CheckCircle2 size={18} color={Colors.light.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Typography variant="tiny" color={Colors.light.textMuted}>SERVICE</Typography>
              <Typography variant="body2" weight="700">{title}</Typography>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
              <Calendar size={18} color={Colors.light.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Typography variant="tiny" color={Colors.light.textMuted}>DATE & TIME</Typography>
              <Typography variant="body2" weight="700">{date}</Typography>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
              <MapPin size={18} color={Colors.light.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Typography variant="tiny" color={Colors.light.textMuted}>ADDRESS</Typography>
              <Typography variant="body2" weight="700" numberOfLines={1}>{address}</Typography>
            </View>
          </View>
        </View>

        <View style={styles.nextSteps}>
          <Typography variant="h4" weight="800" style={{ marginBottom: Spacing.lg }}>Next Steps</Typography>
          <View style={styles.stepItem}>
            <Typography variant="h3" weight="900" color={Colors.light.primaryLight}>01</Typography>
            <Typography variant="body2" style={{ marginLeft: Spacing.md, flex: 1 }}>
              Partner assignment within 15 minutes
            </Typography>
          </View>
          <View style={styles.stepItem}>
            <Typography variant="h3" weight="900" color={Colors.light.primaryLight}>02</Typography>
            <Typography variant="body2" style={{ marginLeft: Spacing.md, flex: 1 }}>
              Partner calls to confirm the location
            </Typography>
          </View>
          <View style={styles.stepItem}>
            <Typography variant="h3" weight="900" color={Colors.light.primaryLight}>03</Typography>
            <Typography variant="body2" style={{ marginLeft: Spacing.md, flex: 1 }}>
              Service delivery & digital payment
            </Typography>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="View My Bookings" 
          onPress={() => navigation.navigate('Bookings')} 
          style={{ marginBottom: Spacing.md }}
        />
        <Button 
          title="Back to Home" 
          onPress={() => navigation.navigate('Main', { screen: 'Home' })} 
          variant="outline"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.white },
  content: { padding: Spacing.xl, alignItems: 'center', paddingBottom: 150 },
  successHeader: { alignItems: 'center', marginTop: Spacing.xxl, marginBottom: Spacing.xxl },
  checkWrapper: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.light.success,
    justifyContent: 'center', alignItems: 'center',
    ...Shadows.light.md,
  },
  subtitle: { marginTop: Spacing.sm, paddingHorizontal: Spacing.lg },
  detailsCard: {
    width: '100%',
    backgroundColor: Colors.light.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xxl,
    borderWidth: 1, borderColor: Colors.light.borderLight,
    ...Shadows.light.sm,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  iconBox: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center', alignItems: 'center',
  },
  nextSteps: { width: '100%', marginTop: Spacing.xxl, paddingHorizontal: Spacing.sm },
  stepItem: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: Spacing.xl,
    backgroundColor: Colors.light.white,
    borderTopWidth: 1, borderTopColor: Colors.light.borderLight,
    ...Shadows.light.lg,
  },
});
