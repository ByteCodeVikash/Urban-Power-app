import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TextInput, FlatList, Pressable, SafeAreaView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Search as SearchIcon, ArrowRight, Sparkles, ShoppingBag, Package, Truck, Wrench } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { CATEGORIES, PRODUCTS, GROCERY_CATEGORIES, SHOP_CATEGORIES, KABADI_ITEMS } from '../../constants/MockData';

const { width } = Dimensions.get('window');

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'Service' | 'Category' | 'Product' | 'Grocery' | 'Shop' | 'Kabadi';
  icon: any;
  route: string;
  params: any;
}

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');

  // Prepare searchable data
  const searchData = useMemo(() => {
    const data: SearchResult[] = [];

    // 1. Service Categories
    CATEGORIES.forEach(cat => {
      data.push({
        id: cat.id,
        title: cat.name,
        subtitle: 'Service Category',
        type: 'Category',
        icon: Sparkles,
        route: 'Subcategory',
        params: { categoryId: cat.id, categoryName: cat.name }
      });

      // 2. Services inside categories
      cat.services.forEach(svc => {
        data.push({
          id: svc.id,
          title: svc.title,
          subtitle: `Service in ${cat.name}`,
          type: 'Service',
          icon: Wrench,
          route: 'ServiceBookingScreen',
          params: { categoryId: cat.id, categoryName: cat.name, selectedServiceId: svc.id }
        });
      });
    });

    // 3. Products
    PRODUCTS.forEach(prod => {
      data.push({
        id: prod.id,
        title: prod.title,
        subtitle: `Product in ${prod.category}`,
        type: 'Product',
        icon: ShoppingBag,
        route: 'ProductDetail',
        params: { productId: prod.id, productTitle: prod.title }
      });
    });

    // 4. Grocery Categories
    GROCERY_CATEGORIES.forEach(cat => {
      data.push({
        id: cat.id,
        title: cat.name,
        subtitle: 'Grocery Category',
        type: 'Grocery',
        icon: Package,
        route: 'GrocerySubCategory',
        params: { categoryId: cat.id, categoryName: cat.name }
      });
    });

    // 5. Shop Categories
    SHOP_CATEGORIES.forEach(cat => {
      data.push({
        id: cat.id,
        title: cat.name,
        subtitle: 'Shop Category',
        type: 'Shop',
        icon: ShoppingBag,
        route: 'ShopSubCategory',
        params: { categoryId: cat.id, categoryName: cat.name }
      });
    });

    // 6. Kabadi Items
    KABADI_ITEMS.forEach(item => {
      data.push({
        id: item.id,
        title: item.title,
        subtitle: 'Kabadi Scrap',
        type: 'Kabadi',
        icon: Truck,
        route: 'KabadiSubCategory',
        params: { categoryId: item.id, categoryName: item.title }
      });
    });

    return data;
  }, []);

  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return searchData.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) || 
      item.subtitle.toLowerCase().includes(lowerQuery) ||
      item.type.toLowerCase().includes(lowerQuery)
    ).slice(0, 15); // Limit results for performance
  }, [query, searchData]);

  const renderResult = ({ item }: { item: SearchResult }) => (
    <Pressable 
      style={styles.resultItem}
      onPress={() => navigation.navigate(item.route, item.params)}
    >
      <View style={[styles.iconWrapper, { backgroundColor: getBgColor(item.type) }]}>
        <item.icon size={20} color={getIconColor(item.type)} />
      </View>
      <View style={styles.resultInfo}>
        <Typography variant="body1" weight="700">{item.title}</Typography>
        <Typography variant="tiny" color={Colors.light.textSecondary}>{item.subtitle}</Typography>
      </View>
      <ArrowRight size={16} color={Colors.light.textMuted} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color={Colors.light.text} size={24} />
        </Pressable>
        <View style={styles.searchWrapper}>
          <SearchIcon size={18} color={Colors.light.primary} style={styles.searchIcon} />
          <TextInput 
            style={styles.input}
            placeholder="Search for services, products..."
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholderTextColor={Colors.light.textMuted}
          />
        </View>
      </View>

      <FlatList 
        data={filteredResults}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={renderResult}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          query.trim() ? (
            <View style={styles.emptyContainer}>
              <Typography variant="body1" color={Colors.light.textMuted}>No results found for "{query}"</Typography>
            </View>
          ) : (
            <View style={styles.suggestContainer}>
              <Typography variant="h4" weight="800" style={{ marginBottom: Spacing.md }}>Popular Searches</Typography>
              <View style={styles.chipRow}>
                {['Cleaning', 'AC Repair', 'Salon', 'Plumber', 'Grocery', 'Kabadi'].map(tag => (
                  <Pressable key={tag} style={styles.chip} onPress={() => setQuery(tag)}>
                    <Typography variant="tiny" weight="700" color={Colors.light.primary}>{tag}</Typography>
                  </Pressable>
                ))}
              </View>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const getBgColor = (type: string) => {
  switch(type) {
    case 'Service': return '#F5F3FF';
    case 'Product': return '#EFF6FF';
    case 'Grocery': return '#FEF2F2';
    case 'Kabadi': return '#F0FDF4';
    default: return Colors.light.surface;
  }
};

const getIconColor = (type: string) => {
  switch(type) {
    case 'Service': return '#7C3AED';
    case 'Product': return '#3B82F6';
    case 'Grocery': return '#EF4444';
    case 'Kabadi': return '#10B981';
    default: return Colors.light.primary;
  }
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center', alignItems: 'center',
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
    height: '100%',
  },
  listContent: { padding: Spacing.lg },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  iconWrapper: {
    width: 40, height: 40, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.md,
  },
  resultInfo: { flex: 1 },
  emptyContainer: { padding: Spacing.xxl, alignItems: 'center' },
  suggestContainer: { padding: Spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.primaryLight,
    borderWidth: 1,
    borderColor: Colors.light.primary + '33',
  },
});
