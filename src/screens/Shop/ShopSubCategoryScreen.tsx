import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Pressable, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { SHOP_CATEGORIES } from '../../constants/MockData';

export default function ShopSubCategoryScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { categoryId, categoryName } = route.params;

  const category = SHOP_CATEGORIES.find(c => c.id === categoryId);
  const subcategories = category?.subcategories || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header 
        title={categoryName} 
        leftComponent={
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.headerBox}>
           <Typography variant="h3" weight="800">Shop by Category</Typography>
           <Typography variant="body2" color={Colors.light.textSecondary}>Choose a collection in {categoryName}</Typography>
        </View>

        <View style={styles.list}>
          {subcategories.map((sub, index) => (
            <Pressable 
              key={index} 
              style={styles.listItem}
              onPress={() => navigation.navigate('ShopProductList', { 
                categoryId, 
                subcategoryName: sub,
                categoryName 
              })}
            >
              <View style={styles.listContent}>
                <View style={styles.dot} />
                <Typography variant="body1" weight="700" style={{ flex: 1 }}>{sub}</Typography>
              </View>
              <ChevronRight size={20} color={Colors.light.textMuted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.white },
  content: { padding: Spacing.lg },
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
  headerBox: {
    marginBottom: Spacing.xl,
  },
  list: {
    gap: Spacing.md,
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
    ...Shadows.light.sm,
  },
  listContent: {
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
});
