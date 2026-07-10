import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import {
  MapPin,
  Phone,
  CheckCircle2,
  Navigation,
  Star,
  XCircle,
} from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { api } from '../../services/api';
import { useBookingDetails } from '../../hooks/useBookings';

function parseBookingNotes(notes: string | null | undefined) {
  if (!notes) {
    return {
      customerName: 'Client',
      phone: '',
      technician: 'None',
      timeslot: '',
      customNotes: '',
    };
  }

  const nameMatch = notes.match(/Customer Name:\s*([^|,\n]+)/i);
  const phoneMatch = notes.match(/Phone:\s*([^|,\n]+)/i);
  const techMatch = notes.match(/Technician:\s*([^|,\n]+)/i);
  const timeslotMatch = notes.match(/Timeslot:\s*([^|,\n]+)/i);

  let customerName = nameMatch ? nameMatch[1].trim() : 'Client';
  let phone = phoneMatch ? phoneMatch[1].trim() : '';
  let technician = techMatch ? techMatch[1].trim() : 'None';
  let timeslot = timeslotMatch ? timeslotMatch[1].trim() : '';

  return { customerName, phone, technician, timeslot };
}

export default function ServiceTrackingScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { bookingId, bookingType = 'beautician' } = route.params as {
    bookingId: string;
    bookingType?: 'beautician' | 'maintenance';
  };

  const {
    data: booking,
    isLoading: loading,
    refetch,
  } = useBookingDetails(bookingId, bookingType);
  const [addressText, setAddressText] = useState<string>('Loading address...');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const serviceName =
    (route.params as any)?.serviceName ||
    (bookingType === 'maintenance' && booking?.service_names?.join(', ')) ||
    'Service Booking';
  const dateStr = (route.params as any)?.dateStr || '';
  const timeslotStr =
    (route.params as any)?.timeslotStr ||
    parseBookingNotes(booking?.notes).timeslot ||
    '';

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

  const status = booking?.status?.toLowerCase() || 'pending';
  const parsed = parseBookingNotes(booking?.notes);
  const technicianName = parsed.technician !== 'None' ? parsed.technician : '';

  // Get formatting for the booking date/time
  const bookingTime = booking?.booking_date
    ? new Date(booking.booking_date).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const steps = [
    {
      title: 'Booking Confirmed',
      subtitle: bookingTime
        ? `Service scheduled for ${bookingTime}`
        : 'Service scheduled',
      status: ['confirmed', 'assigned', 'in_progress', 'completed'].includes(
        status,
      )
        ? 'completed'
        : status === 'pending'
          ? 'active'
          : 'pending',
      time: status !== 'pending' ? 'Done' : '--:--',
    },
    {
      title: 'Partner Assigned',
      subtitle: technicianName
        ? `${technicianName} is your professional`
        : 'Assigning professional',
      status: ['assigned', 'in_progress', 'completed'].includes(status)
        ? 'completed'
        : status === 'confirmed'
          ? 'active'
          : 'pending',
      time: ['assigned', 'in_progress', 'completed'].includes(status)
        ? 'Done'
        : '--:--',
    },
    {
      title: 'In Transit',
      subtitle: technicianName
        ? `${technicianName} is arriving at your location`
        : 'Partner is arriving',
      status: ['in_progress', 'completed'].includes(status)
        ? 'completed'
        : status === 'assigned'
          ? 'active'
          : 'pending',
      time: ['in_progress', 'completed'].includes(status) ? 'Done' : '--:--',
    },
    {
      title: 'Service in Progress',
      subtitle: 'Work started',
      status:
        status === 'completed'
          ? 'completed'
          : status === 'in_progress'
            ? 'active'
            : 'pending',
      time: status === 'completed' ? 'Done' : '--:--',
    },
  ];

  // Dynamic Header contents
  let headerTitle = 'Booking Status';
  let headerSubtitle = 'Awaiting updates';
  let showEta = false;
  let headerBgColor = Colors.light.white;

  if (status === 'pending') {
    headerTitle = 'Awaiting Confirmation';
    headerSubtitle = 'We are verifying your service slot';
  } else if (status === 'confirmed') {
    headerTitle = 'Booking Confirmed';
    headerSubtitle = 'Assigning professional partner';
  } else if (status === 'assigned') {
    headerTitle = 'Partner is Arriving';
    headerSubtitle = `${technicianName} is on the way`;
    showEta = true;
  } else if (status === 'in_progress') {
    headerTitle = 'Service in Progress';
    headerSubtitle = `${technicianName} has started work`;
  } else if (status === 'completed') {
    headerTitle = 'Service Completed';
    headerSubtitle = 'Thank you for using Urban Power!';
  } else if (status === 'cancelled') {
    headerTitle = 'Booking Cancelled';
    headerSubtitle = 'This booking was cancelled';
    headerBgColor = '#FEE2E2';
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Service Tracking" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.light.primary]}
            tintColor={Colors.light.primary}
          />
        }
      >
        {/* Cancelled Banner */}
        {status === 'cancelled' && (
          <View style={styles.cancelledBanner}>
            <XCircle size={20} color={Colors.light.white} />
            <Typography
              variant="body2"
              color={Colors.light.white}
              weight="700"
              style={{ marginLeft: 8 }}
            >
              This booking has been cancelled.
            </Typography>
          </View>
        )}

        {/* Live Status Header */}
        <View style={[styles.statusHeader, { backgroundColor: headerBgColor }]}>
          <View
            style={[
              styles.statusIcon,
              status === 'cancelled' && { backgroundColor: '#EF4444' },
              status === 'completed' && {
                backgroundColor: Colors.light.success,
              },
            ]}
          >
            {status === 'cancelled' ? (
              <XCircle size={24} color={Colors.light.white} />
            ) : status === 'completed' ? (
              <CheckCircle2 size={24} color={Colors.light.white} />
            ) : (
              <Navigation size={24} color={Colors.light.white} />
            )}
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Typography
              variant="body2"
              color={Colors.light.textSecondary}
              weight="600"
            >
              ID: #SRV-{bookingId.slice(0, 8).toUpperCase()}
            </Typography>
            <Typography variant="h3" weight="800">
              {headerTitle}
            </Typography>
            <Typography variant="caption" color={Colors.light.textSecondary}>
              {headerSubtitle}
            </Typography>
          </View>
          {showEta && (
            <View style={styles.etaBadge}>
              <Typography
                variant="h4"
                weight="900"
                color={Colors.light.primary}
              >
                15
              </Typography>
              <Typography
                variant="tiny"
                weight="700"
                color={Colors.light.primary}
              >
                MINS
              </Typography>
            </View>
          )}
        </View>

        {/* Action Card */}
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
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Typography variant="body1" weight="800">
                  {technicianName}
                </Typography>
                <View style={styles.ratingRow}>
                  <Star size={14} color="#F59E0B" fill="#F59E0B" />
                  <Typography
                    variant="body2"
                    weight="700"
                    style={{ marginLeft: 4 }}
                  >
                    4.9
                  </Typography>
                  <Typography
                    variant="caption"
                    color={Colors.light.textMuted}
                    style={{ marginLeft: 8 }}
                  >
                    Partner Professional
                  </Typography>
                </View>
              </View>
              <View style={styles.actionIcons}>
                <Pressable
                  style={styles.iconBtn}
                  onPress={() => Linking.openURL('tel:9876543210')}
                >
                  <Phone size={20} color={Colors.light.primary} />
                </Pressable>
              </View>
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
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Typography
                  variant="body1"
                  weight="800"
                  color={Colors.light.textMuted}
                >
                  Assigning Professional...
                </Typography>
                <Typography variant="body2" color={Colors.light.textSecondary}>
                  We are assigning a professional partner shortly.
                </Typography>
              </View>
            </View>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.section}>
          <Typography
            variant="h4"
            weight="800"
            style={{ marginBottom: Spacing.xl }}
          >
            Journey
          </Typography>
          {steps.map((step, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.dot,
                    step.status === 'completed' && {
                      backgroundColor: Colors.light.success,
                    },
                    step.status === 'active' && {
                      backgroundColor: Colors.light.primary,
                      borderWidth: 4,
                      borderColor: Colors.light.primaryLight,
                    },
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
                      step.status === 'completed' && {
                        backgroundColor: Colors.light.success,
                      },
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

        {/* Summary Card */}
        <View style={styles.section}>
          <Typography
            variant="h4"
            weight="800"
            style={{ marginBottom: Spacing.lg }}
          >
            Service Summary
          </Typography>
          <View style={styles.summaryRow}>
            <View style={styles.summaryIcon}>
              <Typography weight="800" color={Colors.light.primary}>
                {serviceName.charAt(0).toUpperCase()}
              </Typography>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Typography variant="body1" weight="800">
                {serviceName}
              </Typography>
              <Typography variant="body2" color={Colors.light.textSecondary}>
                Date: {dateStr || 'Scheduled'}{' '}
                {timeslotStr ? `• Slot: ${timeslotStr}` : ''}
              </Typography>
            </View>
            <Typography variant="body2" weight="800">
              ₹{booking?.total_price || 0}
            </Typography>
          </View>
          <View style={styles.addressBox}>
            <MapPin size={18} color={Colors.light.textMuted} />
            <Typography variant="body2" style={{ marginLeft: 12, flex: 1 }}>
              {addressText}
            </Typography>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Need help?"
          variant="outline"
          style={{ flex: 1, marginRight: Spacing.md }}
          onPress={() => navigation.navigate('HelpSupport')}
        />
        <Button
          title="Go to Bookings"
          style={{ flex: 1 }}
          onPress={() => navigation.navigate('Bookings')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.white },
  content: { padding: Spacing.lg },
  cancelledBanner: {
    backgroundColor: '#EF4444',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
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
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  etaBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.primary,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.light.md,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  actionIcons: { flexDirection: 'row', gap: Spacing.md },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  section: {
    backgroundColor: Colors.light.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    ...Shadows.light.xs,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  timelineItem: { flexDirection: 'row', minHeight: 80 },
  timelineLeft: { alignItems: 'center', width: 32, marginRight: Spacing.lg },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  line: {
    width: 3,
    flex: 1,
    backgroundColor: Colors.light.borderLight,
    marginVertical: -4,
    zIndex: 1,
  },
  timelineRight: { flex: 1, paddingBottom: Spacing.xl },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
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
});
