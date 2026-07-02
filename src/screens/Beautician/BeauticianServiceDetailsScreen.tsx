import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Plus, Minus, Clock, Info } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { NetworkImage } from '../../components/NetworkImage';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { useBeauticianServices } from '../../hooks/useBeautician';
import { useBeauticianStore } from '../../store/useBeauticianStore';
import { RootStackParamList } from '../../navigation/Types';

type BeauticianServiceDetailsRouteProp = RouteProp<
  RootStackParamList,
  'BeauticianServiceDetails'
>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

export default function BeauticianServiceDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<BeauticianServiceDetailsRouteProp>();
  const { serviceId, serviceTitle } = route.params;

  // Fetch all services and find the match
  const { data: services, isLoading, error } = useBeauticianServices(undefined);
  const service = services?.find((s: any) => s.id === serviceId);

  const selectedServices = useBeauticianStore(state => state.selectedServices);
  const addService = useBeauticianStore(state => state.addService);
  const removeService = useBeauticianStore(state => state.removeService);

  const isSelected = selectedServices.some(s => s.id === serviceId);

  const handleToggle = () => {
    if (service) {
      if (isSelected) {
        removeService(service.id);
      } else {
        addService(service);
      }
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft color={Colors.light.text} size={24} />
          </Pressable>
          <Typography variant="h3" weight="700">
            {serviceTitle}
          </Typography>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !service) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft color={Colors.light.text} size={24} />
          </Pressable>
          <Typography variant="h3" weight="700">
            {serviceTitle}
          </Typography>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.centered}>
          <Typography variant="body1" color={Colors.light.textSecondary}>
            Failed to load service details.
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color={Colors.light.text} size={24} />
        </Pressable>
        <Typography variant="h3" weight="700">
          Details
        </Typography>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.imageContainer}>
          {service.image ? (
            <NetworkImage
              source={{ uri: service.image }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.fallbackImage}>
              <Typography variant="h1" color={Colors.light.primary}>
                {service.name.charAt(0)}
              </Typography>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.titlePriceRow}>
            <Typography
              variant="h2"
              weight="800"
              color={Colors.light.text}
              style={styles.title}
            >
              {service.name}
            </Typography>
            <Typography variant="h2" weight="800" color={Colors.light.primary}>
              ₹{service.price}
            </Typography>
          </View>

          {service.duration && (
            <View style={styles.durationRow}>
              <Clock size={16} color={Colors.light.textSecondary} />
              <Typography
                variant="body2"
                color={Colors.light.textSecondary}
                weight="600"
              >
                Duration: {service.duration} mins
              </Typography>
            </View>
          )}

          <Typography
            variant="body1"
            color={Colors.light.textSecondary}
            style={styles.description}
          >
            {service.description ||
              'No description available for this beauty service.'}
          </Typography>

          <View style={styles.divider} />

          <View style={styles.instructionsContainer}>
            <View style={styles.instructionRow}>
              <Info size={20} color={Colors.light.primary} />
              <Typography
                variant="body2"
                color={Colors.light.text}
                style={styles.instructionText}
              >
                We bring all the professional tools and cosmetic products to
                your home.
              </Typography>
            </View>
            <View style={styles.instructionRow}>
              <Info size={20} color={Colors.light.primary} />
              <Typography
                variant="body2"
                color={Colors.light.text}
                style={styles.instructionText}
              >
                Please ensure a clean workspace and access to water/electricity
                if required.
              </Typography>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionFooter}>
        <Pressable
          style={[styles.primaryAddBtn, isSelected && styles.primaryRemoveBtn]}
          onPress={handleToggle}
        >
          {isSelected ? (
            <Minus
              color={Colors.light.white}
              size={20}
              style={{ marginRight: 8 }}
            />
          ) : (
            <Plus
              color={Colors.light.white}
              size={20}
              style={{ marginRight: 8 }}
            />
          )}
          <Typography variant="body1" color={Colors.light.white} weight="700">
            {isSelected ? 'Remove from Selection' : 'Add to Selection'}
          </Typography>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.white },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { paddingBottom: 120 },
  imageContainer: {
    width: width,
    height: 250,
    backgroundColor: Colors.light.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallbackImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    padding: Spacing.lg,
  },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  title: {
    flex: 1,
    marginRight: Spacing.md,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  description: {
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginVertical: Spacing.lg,
  },
  instructionsContainer: {
    gap: Spacing.md,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  instructionText: {
    flex: 1,
    lineHeight: 20,
  },
  actionFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    backgroundColor: Colors.light.white,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    ...Shadows.light.md,
  },
  primaryAddBtn: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryRemoveBtn: {
    backgroundColor: '#DC2626',
  },
});
