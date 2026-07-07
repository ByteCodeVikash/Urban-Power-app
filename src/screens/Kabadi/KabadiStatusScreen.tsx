import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import {
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
} from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { useScrapBookingDetails } from '../../hooks/useBookings';
import { api } from '../../services/api';

function parseBookingNotes(notes: string | null | undefined) {
  if (!notes) {
    return {
      customerName: 'Client',
      phone: '',
      technician: 'None',
      customNotes: '',
    };
  }

  const nameMatch = notes.match(/Customer Name:\s*([^,\n]+)/i);
  const phoneMatch = notes.match(/Phone:\s*([^,\n]+)/i);
  const techMatch = notes.match(/Technician:\s*([^,\n]+)/i);

  let customerName = nameMatch ? nameMatch[1].trim() : 'Client';
  let phone = phoneMatch ? phoneMatch[1].trim() : '';
  let technician = techMatch ? techMatch[1].trim() : 'None';

  return { customerName, phone, technician };
}

export default function KabadiStatusScreen() {
  const route = useRoute();
  const { bookingId } = route.params as { bookingId: string };

  const {
    data: booking,
    isLoading: loading,
    refetch,
  } = useScrapBookingDetails(bookingId);
  const [addressText, setAddressText] = useState<string>('Loading address...');

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  useEffect(() => {
    if (!booking) return;

    if (booking.address_text) {
      setAddressText(booking.address_text);
    } else if (booking.address_id) {
      api.address
        .getAddresses()
        .then((addrs: any) => {
          const match = addrs.find(
            (a: any) => String(a.id) === String(booking.address_id),
          );
          if (match) {
            const formattedAddr = [
              match.house_number,
              match.street,
              match.landmark ? `Near ${match.landmark}` : null,
              match.city,
              match.pincode,
            ]
              .filter(Boolean)
              .join(', ');
            setAddressText(formattedAddr);
          } else {
            setAddressText('Address details not found');
          }
        })
        .catch((err: any) => {
          console.error('Failed to fetch address details:', err);
          setAddressText('Error loading address');
        });
    } else {
      setAddressText('No address associated');
    }
  }, [booking]);

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Typography
          variant="body2"
          color={Colors.light.textSecondary}
          style={{ marginTop: 12 }}
        >
          Fetching live tracking status...
        </Typography>
      </SafeAreaView>
    );
  }

  const status = booking?.status?.toLowerCase() || 'requested';
  const parsed = parseBookingNotes(booking?.notes);
  const technicianName = parsed.technician !== 'None' ? parsed.technician : '';

  const steps = [
    {
      title: 'Request Placed',
      subtitle: 'Awaiting partner assignment',
      status: ['assigned', 'in_progress', 'completed'].includes(status)
        ? 'completed'
        : ['requested', 'pending'].includes(status)
          ? 'active'
          : 'pending',
      time: status !== 'requested' && status !== 'pending' ? 'Done' : '--:--',
    },
    {
      title: 'Partner Assigned',
      subtitle: technicianName
        ? `${technicianName} is your partner`
        : 'Assigning partner',
      status: ['in_progress', 'completed'].includes(status)
        ? 'completed'
        : status === 'assigned'
          ? 'active'
          : 'pending',
      time: ['in_progress', 'completed'].includes(status) ? 'Done' : '--:--',
    },
    {
      title: 'Pickup in Progress',
      subtitle: 'Weighing & valuation',
      status:
        status === 'completed'
          ? 'completed'
          : status === 'in_progress'
            ? 'active'
            : 'pending',
      time: status === 'completed' ? 'Done' : '--:--',
    },
    {
      title: 'Completed',
      subtitle: 'Payment sent to wallet',
      status: status === 'completed' ? 'active' : 'pending',
      time: status === 'completed' ? 'Done' : '--:--',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Track Pickup" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Cancelled Banner */}
        {status === 'cancelled' && (
          <View
            style={[
              styles.cancelledBanner,
              {
                backgroundColor: '#EF4444',
                padding: Spacing.md,
                borderRadius: BorderRadius.lg,
                marginBottom: Spacing.md,
                flexDirection: 'row',
                alignItems: 'center',
              },
            ]}
          >
            <XCircle size={20} color={Colors.light.white} />
            <Typography
              variant="body2"
              color={Colors.light.white}
              weight="700"
              style={{ marginLeft: 8 }}
            >
              This pickup has been cancelled.
            </Typography>
          </View>
        )}

        {/* Live ID & ETA */}
        <View style={styles.topInfo}>
          <View>
            <Typography variant="caption" color={Colors.light.textMuted}>
              ORDER ID
            </Typography>
            <Typography variant="body1" weight="800">
              #KB-{bookingId.slice(0, 8).toUpperCase()}
            </Typography>
          </View>
          {status !== 'completed' && status !== 'cancelled' && (
            <View style={styles.etaBox}>
              <Clock size={16} color={Colors.light.primary} />
              <Typography
                variant="body1"
                weight="800"
                color={Colors.light.primary}
                style={{ marginLeft: 6 }}
              >
                15 MINS
              </Typography>
            </View>
          )}
        </View>

        {/* Status Timeline */}
        <View style={styles.section}>
          <Typography
            variant="h4"
            weight="800"
            style={{ marginBottom: Spacing.xl }}
          >
            Pickup Progress
          </Typography>

          {steps.map((step, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.dot,
                    step.status === 'completed' && styles.dotCompleted,
                    step.status === 'active' && styles.dotActive,
                  ]}
                >
                  {step.status === 'completed' && (
                    <CheckCircle2 size={16} color={Colors.light.white} />
                  )}
                </View>
                {index !== steps.length - 1 && (
                  <View
                    style={[
                      styles.line,
                      step.status === 'completed' && styles.lineCompleted,
                    ]}
                  />
                )}
              </View>

              <View style={styles.timelineRight}>
                <View style={styles.stepHeader}>
                  <Typography
                    variant="body1"
                    weight="700"
                    color={
                      step.status === 'pending'
                        ? Colors.light.textMuted
                        : Colors.light.text
                    }
                  >
                    {step.title}
                  </Typography>
                  <Typography variant="caption" color={Colors.light.textMuted}>
                    {step.time}
                  </Typography>
                </View>
                <Typography variant="body2" color={Colors.light.textSecondary}>
                  {step.subtitle}
                </Typography>
              </View>
            </View>
          ))}
        </View>

        {/* Partner Card */}
        {technicianName ? (
          <View style={styles.partnerCard}>
            <View style={styles.partnerInfo}>
              <View style={styles.avatar}>
                <Typography
                  variant="h3"
                  weight="800"
                  color={Colors.light.white}
                >
                  {technicianName
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </Typography>
              </View>
              <View style={styles.partnerText}>
                <Typography variant="body1" weight="800">
                  {technicianName}
                </Typography>
                <Typography variant="caption" color={Colors.light.textMuted}>
                  4.9 ★ • Partner Professional
                </Typography>
              </View>
            </View>
            <View style={styles.actionRow}>
              <Pressable
                style={styles.iconBtn}
                onPress={() => Linking.openURL('tel:9876543210')}
              >
                <Phone size={20} color={Colors.light.primary} />
              </Pressable>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.partnerCard,
              { borderLeftColor: Colors.light.border },
            ]}
          >
            <View style={styles.partnerInfo}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: Colors.light.border },
                ]}
              >
                <Typography
                  variant="h3"
                  weight="800"
                  color={Colors.light.textMuted}
                >
                  ?
                </Typography>
              </View>
              <View style={styles.partnerText}>
                <Typography
                  variant="body1"
                  weight="800"
                  color={Colors.light.textMuted}
                >
                  Assigning Partner...
                </Typography>
                <Typography variant="body2" color={Colors.light.textSecondary}>
                  We are assigning a professional partner shortly.
                </Typography>
              </View>
            </View>
          </View>
        )}

        {/* Pickup Details */}
        <View style={styles.section}>
          <Typography
            variant="h4"
            weight="800"
            style={{ marginBottom: Spacing.lg }}
          >
            Pickup Details
          </Typography>
          <View style={styles.detailRow}>
            <MapPin size={18} color={Colors.light.textMuted} />
            <Typography variant="body2" style={{ marginLeft: 12, flex: 1 }}>
              {addressText}
            </Typography>
          </View>
          <View style={[styles.detailRow, { marginTop: Spacing.md }]}>
            <Truck size={18} color={Colors.light.textMuted} />
            <Typography variant="body2" style={{ marginLeft: 12 }}>
              Category:{' '}
              {booking?.category_name || booking?.item_name || 'Mixed'}
            </Typography>
          </View>
          {booking?.estimated_weight_kg ? (
            <View style={[styles.detailRow, { marginTop: Spacing.md }]}>
              <Clock size={18} color={Colors.light.textMuted} />
              <Typography variant="body2" style={{ marginLeft: 12 }}>
                Est. Weight: {booking.estimated_weight_kg} kg
              </Typography>
            </View>
          ) : null}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Need help?"
          variant="outline"
          style={{ flex: 1, marginRight: Spacing.md }}
        />
        {status !== 'completed' && status !== 'cancelled' && (
          <Button title="Cancel Pickup" variant="danger" style={{ flex: 1 }} />
        )}
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
    width: 24,
    height: 24,
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerText: { marginLeft: Spacing.md },
  actionRow: { flexDirection: 'row', gap: Spacing.sm },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
    backgroundColor: Colors.light.white,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    ...Shadows.light.lg,
  },
  cancelledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
