import React from 'react';
import { View, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { Header } from '../../components/Header';
import { CategoryCard } from '../../components/CategoryCard';
import { useCategories } from '../../hooks/useServices';
import { Colors, Spacing } from '../../constants/Theme';
import { Typography } from '../../components/Typography';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/Types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CategoriesScreen() {
  const { data: categories, isLoading } = useCategories();
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="All Categories" />
      <View style={styles.container}>
        <Typography variant="body2" color={Colors.light.textSecondary} style={styles.subtitle}>
          Choose a service category to get started
        </Typography>
        
        <FlatList
          data={categories}
          numColumns={3}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <CategoryCard 
                category={item} 
                onPress={() => {
                  if (item.id === 'c2') {
                    navigation.navigate('GenderPicker', { categoryId: 'c2', categoryName: 'Beauty' });
                  } else if (item.id === 'c10') {
                    navigation.navigate('GenderPicker', { categoryId: 'c10', categoryName: 'Massage' });
                  } else if (item.id.startsWith('c')) {
                    navigation.navigate('Subcategory', { categoryId: item.id, categoryName: item.name });
                  } else {
                    navigation.navigate('CategoryDetail', { 
                      categoryId: item.id, 
                      categoryName: item.name,
                      isTab: false 
                    });
                  }
                }}
              />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  subtitle: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xs,
  },
  listContent: {
    paddingBottom: 100, // Space for custom tab bar
  },
  cardWrapper: {
    flex: 1/3,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
});
