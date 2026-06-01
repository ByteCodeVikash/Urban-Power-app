import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronRight, ShoppingBag } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { SHOP_CATEGORIES } from '../../constants/MockData';
import { NetworkImage } from '../../components/NetworkImage';

export default function ShopSubcategoriesScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { categoryId, categoryName } = route.params;

  const category = SHOP_CATEGORIES.find(c => c.id === categoryId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={categoryName} showBack />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.banner}>
           <NetworkImage source={{ uri: category?.icon || '' }} style={styles.bannerIcon} resizeMode="cover" />
           <View style={{ marginLeft: Spacing.lg, flex: 1 }}>
              <Typography variant="h2" weight="900" color={Colors.light.primary}>
                {categoryName}
              </Typography>
              <Typography variant="body2" color={Colors.light.textSecondary}>
                Explore the best in {categoryName.toLowerCase()}
              </Typography>
           </View>
        </View>

        <Typography variant="h3" weight="800" style={styles.sectionTitle}>
          Categories
        </Typography>

        <View style={styles.list}>
          {category?.subcategories.map((sub, index) => (
            <Pressable 
              key={index} 
              style={styles.listItem}
              onPress={() => {
                navigation.navigate('ProductList', { 
                  categoryId, 
                  categoryName, 
                  subcategoryName: sub 
                });
              }}
            >
              <View style={styles.listIcon}>
                <ShoppingBag size={20} color={Colors.light.primary} />
              </View>
              <Typography variant="body1" weight="700" style={{ flex: 1, marginLeft: Spacing.md }}>
                {sub}
              </Typography>
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
  content: { padding: Spacing.xl, paddingBottom: 150 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xxl,
    marginBottom: Spacing.xxl,
    borderWidth: 1, borderColor: Colors.light.borderLight,
  },
  bannerIcon: { width: 60, height: 60 },
  sectionTitle: { marginBottom: Spacing.lg },
  list: { gap: Spacing.md },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.light.borderLight,
    ...Shadows.light.sm,
  },
  listIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center', alignItems: 'center',
  },
});
