import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CheckCircle2, Leaf, Droplets, Wind, Home, Share2 } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';

export default function KabadiBookingScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.successIcon}>
          <CheckCircle2 size={80} color={Colors.light.success} />
          <Typography variant="h2" weight="900" style={{ marginTop: Spacing.xl }}>Pickup Scheduled!</Typography>
          <Typography variant="body1" color={Colors.light.textSecondary} align="center" style={styles.subtitle}>
            Our Green Partner will arrive at your doorstep as scheduled.
          </Typography>
        </View>

        <View style={styles.impactCard}>
          <Typography variant="body2" weight="900" color={Colors.light.success} style={{ marginBottom: Spacing.lg }}>
            YOUR SUSTAINABILITY IMPACT
          </Typography>
          
          <View style={styles.impactRow}>
             <View style={styles.impactItem}>
                <Leaf size={24} color="#10B981" />
                <Typography variant="h3" weight="900" style={{ marginTop: 8 }}>2.4</Typography>
                <Typography variant="tiny" weight="700" color={Colors.light.textMuted}>TREES SAVED</Typography>
             </View>
             <View style={styles.impactItem}>
                <Droplets size={24} color="#3B82F6" />
                <Typography variant="h3" weight="900" style={{ marginTop: 8 }}>45L</Typography>
                <Typography variant="tiny" weight="700" color={Colors.light.textMuted}>WATER SAVED</Typography>
             </View>
             <View style={styles.impactItem}>
                <Wind size={24} color="#6366F1" />
                <Typography variant="h3" weight="900" style={{ marginTop: 8 }}>12kg</Typography>
                <Typography variant="tiny" weight="700" color={Colors.light.textMuted}>CO2 REDUCED</Typography>
             </View>
          </View>
        </View>

        <View style={styles.nextSteps}>
           <Typography variant="body1" weight="800" style={{ marginBottom: Spacing.md }}>What happens next?</Typography>
           <View style={styles.stepRow}>
              <View style={styles.stepDot} />
              <Typography variant="body2">Partner will call 30 mins before arrival</Typography>
           </View>
           <View style={styles.stepRow}>
              <View style={styles.stepDot} />
              <Typography variant="body2">Digital weighing & instant UPI payment</Typography>
           </View>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Track My Pickup" 
          onPress={() => navigation.navigate('KabadiStatus', { bookingId: '89102' })} 
          style={{ marginBottom: Spacing.md }}
        />
        <Button 
          title="Back to Home" 
          onPress={() => navigation.navigate('Home' as never)} 
          variant="outline"
          style={{ marginBottom: Spacing.md }}
          icon={<Home size={20} color={Colors.light.primary} />}
        />
        <Pressable style={styles.shareBtn}>
           <Share2 size={18} color={Colors.light.text} />
           <Typography variant="body2" weight="700" style={{ marginLeft: 8 }}>Share Impact</Typography>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.white },
  content: { padding: Spacing.xxl, alignItems: 'center' },
  successIcon: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  subtitle: { marginTop: Spacing.md, paddingHorizontal: Spacing.xl },
  impactCard: {
    width: '100%',
    backgroundColor: '#F0FDF4',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xxl,
    borderWidth: 1, borderColor: '#DCFCE7',
    ...Shadows.light.sm,
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  impactItem: { alignItems: 'center', flex: 1 },
  nextSteps: {
    width: '100%',
    marginTop: Spacing.xxl,
    padding: Spacing.xl,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xl,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  stepDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.light.primary,
    marginRight: Spacing.md,
  },
  footer: {
    padding: Spacing.xl,
    backgroundColor: Colors.light.white,
    borderTopWidth: 1, borderTopColor: Colors.light.borderLight,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
});
