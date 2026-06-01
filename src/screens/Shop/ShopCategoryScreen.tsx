import React from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, Pressable, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/Types';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { NetworkImage } from '../../components/NetworkImage';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { SHOP_CATEGORIES } from '../../constants/MockData';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ShopCategoryScreen() {
  const navigation = useNavigation<NavigationProp>();

  const renderItem = ({ item }: any) => (
    <Pressable 
      style={styles.categoryCard}
      onPress={() => navigation.navigate('ShopSubCategory', { 
        categoryId: item.id, 
        categoryName: item.name 
      })}
    >
      <View style={styles.iconContainer}>
        <NetworkImage source={{ uri: item.icon }} style={styles.icon} resizeMode="cover" />
      </View>
      <Typography variant="body2" weight="700" style={styles.categoryTitle} numberOfLines={2}>
        {item.name}
      </Typography>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Shopping" />
      
      <FlatList
        data={SHOP_CATEGORIES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={styles.infoBox}>
            <Typography variant="body2" color={Colors.light.textSecondary} style={{ textAlign: 'center' }}>
              Explore latest trends in fashion, electronics, and home decor. Best prices guaranteed.
            </Typography>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  content: { paddingVertical: Spacing.md, paddingBottom: 100 },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: Colors.light.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.light.sm,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  icon: { width: 34, height: 34 },
  categoryTitle: { textAlign: 'center', color: Colors.light.text, fontSize: 13 },
  infoBox: {
    marginTop: Spacing.xl,
    marginHorizontal: 16,
    padding: Spacing.xl,
    backgroundColor: '#FDF2F8',
    borderRadius: BorderRadius.xl,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#DB2777',
  },
});
