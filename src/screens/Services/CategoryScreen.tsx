import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/Types';
import { useCategories } from '../../hooks/useServices';
import { useCartStore } from '../../store/useCartStore';
import { Header } from '../../components/Header';
import { ServiceCard } from '../../components/ServiceCard';
import { Colors, Spacing } from '../../constants/Theme';

type CategoryScreenRouteProp = RouteProp<RootStackParamList, 'CategoryDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CategoryScreen() {
  const route = useRoute<CategoryScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  
  // Safely extract params with defaults to prevent crash
  const params = route.params || {} as any;
  const categoryId = params.categoryId || 'c1';
  const categoryName = params.categoryName || 'Category';
  const isTab = params.isTab || false;
  
  const { data: categories, isLoading } = useCategories();
  const addItem = useCartStore((state) => state.addItem);

  const category = categories?.find((c) => c.id === categoryId);

  return (
    <SafeAreaView style={styles.safeArea}>
      {!isTab && <Header title={categoryName} showBack />}
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <ServiceCard key={i} loading />)
        ) : (
          category?.services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onAdd={() => addItem(service)}
              onPress={() => navigation.navigate('ServiceDetail', { serviceId: service.id, serviceTitle: service.title })}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
  },
});
