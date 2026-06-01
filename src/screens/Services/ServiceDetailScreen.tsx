import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { NetworkImage } from '../../components/NetworkImage';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  useAnimatedScrollHandler, 
  useSharedValue, 
  useAnimatedStyle,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import { ChevronLeft, Star } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/Types';
import { useServiceDetails } from '../../hooks/useServices';
import { useServiceBookingStore } from '../../store/useServiceBookingStore';
import { useCartStore } from '../../store/useCartStore';
import { Typography } from '../../components/Typography';
import { RatingStars } from '../../components/RatingStars';
import { Button } from '../../components/Button';
import { Accordion } from '../../components/Accordion';
import { Colors, Spacing, Shadows, BorderRadius } from '../../constants/Theme';

const { width } = Dimensions.get('window');

type ServiceDetailRouteProp = RouteProp<RootStackParamList, 'ServiceDetail'>;

export default function ServiceDetailScreen() {
  const route = useRoute<ServiceDetailRouteProp>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const serviceId = route?.params?.serviceId;

  const { data: service, isLoading } = useServiceDetails(serviceId);
  const addBooking = useServiceBookingStore((state) => state.addBooking);
  const addItem = useCartStore((state) => state.addItem);

  const handleBookNow = () => {
    if (!service) return;
    addBooking({
      serviceId: service.id,
      serviceTitle: service.title,
      date: 'Pending', // In a real app, open date picker
      time: 'Pending',
      status: 'Pending',
      price: service.price,
    });
    alert('Service booking request added!');
    navigation.navigate('Bookings' as any);
  };

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const stickyBottomStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 100],
      [100, 0], // slide up when scroll down
      Extrapolation.CLAMP
    );
    return {
      transform: [{ translateY }],
    };
  });

  if (isLoading || !service) return null;

  return (
    <View style={styles.container}>
      <Animated.ScrollView 
        bounces={false} 
        style={styles.scroll}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <View style={styles.imageContainer}>
          <NetworkImage 
            source={service?.image ? { uri: service.image } : { uri: '' }} 
            style={styles.image} 
            resizeMode="cover"
          />
          <View style={[styles.backButtonOuter, { top: insets.top + Spacing.sm }]}>
            <View style={styles.backButtonInner}>
              <ChevronLeft 
                color={Colors.light.text} 
                size={24} 
                onPress={() => navigation.goBack()} 
              />
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Typography variant="h2" weight="700" style={styles.title}>
            {service?.title}
          </Typography>
          
          <RatingStars rating={service?.rating || 0} reviews={service?.reviews || 0} size={20} />
          
          <View style={styles.priceRow}>
            <Typography variant="h1" weight="700" color={Colors.light.primary}>
              ₹{service?.price}
            </Typography>
            <Typography variant="body1" color={Colors.light.textSecondary} style={styles.duration}>
              • {service?.duration}
            </Typography>
          </View>

          <View style={styles.divider} />

          <Accordion title="About the service">
            <Typography variant="body1" color={Colors.light.textSecondary} style={{ lineHeight: 24 }}>
              Experience top-tier quality with our trained professionals. We use industry-standard tools and eco-friendly products to ensure standard service delivery right at your doorstep. Clean, safe, and fully guaranteed.
            </Typography>
          </Accordion>

          <Accordion title="What's included?">
            {['Deep cleaning of all accessible surfaces', 'Use of professional-grade equipment', 'Post-service cleanup', '30-day service warranty'].map((item, i) => (
              <View key={i} style={styles.listItem}>
                <View style={styles.bulletPoint} />
                <Typography variant="body1">{item}</Typography>
              </View>
            ))}
          </Accordion>

          <Accordion title="Customer Reviews">
            {service.detailedReviews?.map((r) => (
              <View key={r.id} style={styles.reviewBlock}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Typography variant="body2" weight="600" color={Colors.light.white}>{r.user[0]}</Typography>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Typography variant="body2" weight="600">{r.user}</Typography>
                    <Typography variant="caption" color={Colors.light.textSecondary}>{r.date}</Typography>
                  </View>
                  <View style={styles.starRow}>
                    <Star color={Colors.light.warning} fill={Colors.light.warning} size={16} />
                    <Typography variant="caption" weight="600" style={{ marginLeft: 4 }}>{r.rating}</Typography>
                  </View>
                </View>
                <Typography variant="body2" color={Colors.light.textSecondary}>{r.text}</Typography>
              </View>
            ))}
          </Accordion>

          <Accordion title="FAQs">
            {service.faqs?.map((f) => (
              <View key={f.id} style={{ marginBottom: Spacing.md }}>
                <Typography variant="body1" weight="600">{f.question}</Typography>
                <Typography variant="body2" color={Colors.light.textSecondary} style={{ marginTop: 4 }}>{f.answer}</Typography>
              </View>
            ))}
          </Accordion>
          
          <View style={{ height: 120 }} />
        </View>
      </Animated.ScrollView>

      {/* Sticky Bottom Header Animated */}
      <Animated.View style={[
        styles.footer, 
        { paddingBottom: Math.max(insets.bottom, Spacing.md) },
        stickyBottomStyle
      ]}>
        <View>
          <Typography variant="h3" weight="700">₹{service.price}</Typography>
          <Typography variant="caption" color={Colors.light.textSecondary}>Tax included</Typography>
        </View>
        <Button 
          title="Add to Cart"
          size="lg"
          onPress={() => addItem(service, 'service')}
          style={{ width: 160 }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.white },
  scroll: { flex: 1 },
  imageContainer: { width, height: 300, position: 'relative' },
  image: { width: '100%', height: '100%' },
  backButtonOuter: { position: 'absolute', left: Spacing.md, zIndex: 10 },
  backButtonInner: {
    width: 40, height: 40, borderRadius: 20, 
    backgroundColor: Colors.light.white,
    justifyContent: 'center', alignItems: 'center',
    ...Shadows.light.sm,
  },
  content: { padding: Spacing.xl },
  title: { marginBottom: Spacing.sm },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: Spacing.lg },
  duration: { marginLeft: Spacing.sm },
  divider: { height: 1, backgroundColor: Colors.light.border, marginVertical: Spacing.md },
  listItem: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  bulletPoint: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.light.primary, marginRight: Spacing.sm },
  reviewBlock: { marginBottom: Spacing.md, padding: Spacing.md, backgroundColor: Colors.light.surface, borderRadius: BorderRadius.md },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  reviewAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.light.primary, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  starRow: { flexDirection: 'row', alignItems: 'center' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.light.white,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.light.borderLight,
    ...Shadows.light.lg,
    borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl,
  },
});
