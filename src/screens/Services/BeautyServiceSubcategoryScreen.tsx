import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';

export default function BeautyServiceSubcategoryScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {
    categoryId,
    categoryName,
    serviceId,
    serviceTitle,
    subcategories = [],
    gender,
  } = route.params || {};

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color={Colors.light.text} size={24} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Typography variant="h3" weight="900">
            {serviceTitle}
          </Typography>
          {gender && (
            <Typography variant="tiny" color={Colors.light.primary} weight="700">
              {gender === 'female' ? '♀ Female' : '♂ Male'}
            </Typography>
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.subtitleBar}>
        <Typography variant="body2" color={Colors.light.textSecondary} weight="600">
          {subcategories.length} option{subcategories.length !== 1 ? 's' : ''} available
        </Typography>
        <Typography variant="tiny" color={Colors.light.textMuted} style={{ marginTop: 4 }}>
          Choose a service in {serviceTitle}
        </Typography>
      </View>

      <FlatList
        data={subcategories}
        keyExtractor={(item, index) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object' && item.name) return item.name;
          return index.toString();
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isObject = typeof item === 'object' && item !== null;
          const subName = isObject ? item.name : item;
          const subPrice = isObject ? item.price : null;

          return (
            <Pressable
              style={({ pressed }) => [styles.listItem, pressed && styles.listItemPressed]}
              onPress={() =>
                navigation.navigate('ServiceBookingScreen', {
                  categoryId,
                  categoryName,
                  selectedServiceId: serviceId,
                  subcategoryName: subName,
                  gender,
                })
              }
            >
              <View style={styles.listContentRow}>
                <View style={styles.dot} />
                <Typography variant="body1" weight="700" style={{ flex: 1 }}>
                  {subName}
                </Typography>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {subPrice ? (
                  <Typography variant="body1" weight="700" color={Colors.light.text}>
                    ₹{subPrice}
                  </Typography>
                ) : null}
                <ChevronRight size={20} color={Colors.light.textMuted} />
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Typography variant="h4" weight="800" align="center" color={Colors.light.textMuted}>
              No subcategories found
            </Typography>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: { alignItems: 'center', flex: 1 },
  subtitleBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: 40,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    marginBottom: Spacing.md,
    ...Shadows.light.sm,
  },
  listItemPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  listContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
  },
  emptyState: {
    paddingVertical: 80,
    alignItems: 'center',
  },
});
