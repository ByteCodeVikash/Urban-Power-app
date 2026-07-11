import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/Types';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { CategoryCard } from '../../components/CategoryCard';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { useMaintenanceCategories } from '../../hooks/useMaintenance';
import { useMaintenanceStore } from '../../store/useMaintenanceStore';
import { getMaintenanceImage } from '../../utils/maintenanceImages';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MaintenanceCategoriesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { data: categories, isLoading, error } = useMaintenanceCategories();

  const selectedServices = useMaintenanceStore(state => state.selectedServices);
  const getSelectedCount = useMaintenanceStore(
    state => state.getSelectedCount,
  )();
  const getTotalPrice = useMaintenanceStore(state => state.getTotalPrice)();
  const clearSelection = useMaintenanceStore(state => state.clearSelection);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Maintenance Services" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !categories) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Maintenance Services" />
        <View style={styles.centered}>
          <Typography variant="body1" color={Colors.light.textSecondary}>
            Failed to load maintenance categories.
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Maintenance Services" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {categories.length === 0 ? (
          <View style={styles.centered}>
            <Typography variant="body1" color={Colors.light.textSecondary}>
              No categories available at the moment.
            </Typography>
          </View>
        ) : (
          <View style={styles.categoryGrid}>
            {categories.map((item: any) => (
              <CategoryCard
                key={item.id}
                category={{
                  id: item.id,
                  name: item.name,
                  icon: item.icon,
                  image: getMaintenanceImage(item.name, item.image),
                }}
                imageHeight={120}
                style={styles.categoryCard}
                onPress={() =>
                  navigation.navigate('MaintenanceServices', {
                    categoryId: item.id,
                    categoryName: item.name,
                  })
                }
              />
            ))}
          </View>
        )}

        <View style={styles.infoBox}>
          <Typography
            variant="body2"
            color={Colors.light.textSecondary}
            style={{ textAlign: 'center' }}
          >
            Explore professional maintenance services at home. Select services,
            configure your packages, and request booking at your convenience.
          </Typography>
        </View>
      </ScrollView>

      {selectedServices.length > 0 && (
        <View style={styles.footerContainer}>
          <View style={styles.footerInfo}>
            <Typography variant="body2" weight="600" color={Colors.light.white}>
              {getSelectedCount} Service(s) Selected
            </Typography>
            <Typography variant="caption" color={Colors.light.primaryLight}>
              Total Value: ₹{getTotalPrice}
            </Typography>
          </View>
          <View style={styles.footerActions}>
            <Pressable style={styles.clearBtn} onPress={clearSelection}>
              <Typography
                variant="body2"
                color={Colors.light.primary}
                weight="700"
              >
                Clear
              </Typography>
            </Pressable>
            <Pressable
              style={styles.viewBtn}
              onPress={() => navigation.navigate('MaintenanceServices')}
            >
              <Typography
                variant="body2"
                color={Colors.light.white}
                weight="700"
              >
                View List
              </Typography>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: Spacing.md, paddingBottom: 120 },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  categoryCard: {
    width: '47%',
    marginBottom: Spacing.sm,
  },
  infoBox: {
    marginTop: Spacing.xl,
    padding: Spacing.xl,
    backgroundColor: Colors.light.primaryLight,
    borderRadius: BorderRadius.xl,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  footerContainer: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.light.primary,
    padding: Spacing.md,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.light.md,
  },
  footerInfo: {
    flexDirection: 'column',
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  clearBtn: {
    backgroundColor: Colors.light.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  viewBtn: {
    backgroundColor: Colors.light.primaryDark || '#5925CC',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.white,
  },
});
