import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Pressable, Image } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { KABADI_ITEMS } from '../../constants/MockData';
import { RootStackParamList } from '../../navigation/Types';

type KabadiSubCategoryRouteProp = RouteProp<RootStackParamList, 'KabadiSubCategory'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function KabadiSubCategoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<KabadiSubCategoryRouteProp>();
  const { categoryId, categoryName } = route.params;

  const selectedCategory = KABADI_ITEMS.find(k => k.id === categoryId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color={Colors.light.text} size={24} />
        </Pressable>
        <Typography variant="h3" weight="700">{categoryName}</Typography>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {selectedCategory?.subcategories.map((sub) => (
            <Pressable 
              key={sub.id} 
              style={styles.subCard}
              onPress={() => navigation.navigate('KabadiForm', { 
                categoryId: sub.id,
                categoryName: categoryName,
                subcategoryName: sub.title
              })}
            >
              <Typography variant="body1" weight="700">{sub.title}</Typography>
              <Typography variant="body2" color={Colors.light.primary} weight="800">
                ₹{sub.price}/kg
              </Typography>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  content: { padding: Spacing.lg },
  grid: { gap: Spacing.md },
  subCard: {
    backgroundColor: Colors.light.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
});
