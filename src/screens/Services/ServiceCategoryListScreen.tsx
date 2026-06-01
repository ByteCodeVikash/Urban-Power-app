import React from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/Types';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { CATEGORIES } from '../../constants/MockData';
import { 
  Sparkles, Scissors, Wrench, Bug, Hand, Flower2, 
  PackageOpen, Settings2, Car, GraduationCap, 
  CalendarDays, Briefcase, Users, PawPrint, LucideIcon 
} from 'lucide-react-native';

const ICON_MAP: Record<string, LucideIcon> = {
  sparkles:    Sparkles,
  scissors:    Scissors,
  wrench:      Wrench,
  pest:        Bug,
  massage:     Hand,
  gardening:   Flower2,
  packers:     PackageOpen,
  maintenance: Settings2,
  autoservice: Car,
  learning:    GraduationCap,
  event:       CalendarDays,
  business:    Briefcase,
  workforce:   Users,
  petcare:     PawPrint,
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ServiceCategoryListScreen() {
  const navigation = useNavigation<NavigationProp>();

  const renderItem = ({ item }: any) => {
    const IconComponent = ICON_MAP[item.icon] || Sparkles;
    
    return (
      <Pressable 
        style={styles.categoryCard}
        onPress={() => {
          if (item.id === 'c2') {
            navigation.navigate('GenderPicker', { categoryId: 'c2', categoryName: 'Beauty' });
          } else if (item.id === 'c10') {
            navigation.navigate('GenderPicker', { categoryId: 'c10', categoryName: 'Massage' });
          } else {
            navigation.navigate('Subcategory', { categoryId: item.id, categoryName: item.name });
          }
        }}
      >
        <View style={styles.iconContainer}>
          <IconComponent color={Colors.light.primary} size={32} />
        </View>
        <Typography variant="body2" weight="700" style={styles.categoryTitle} numberOfLines={2}>
          {item.name}
        </Typography>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="All Services" showBack />
      
      <FlatList
        data={CATEGORIES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={styles.infoBox}>
            <Typography variant="body2" color={Colors.light.textSecondary} style={{ textAlign: 'center' }}>
              Book top-rated professionals for all your home needs. Verified and background-checked experts.
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryTitle: { textAlign: 'center', color: Colors.light.text, fontSize: 13 },
  infoBox: {
    marginTop: Spacing.xl,
    marginHorizontal: 16,
    padding: Spacing.xl,
    backgroundColor: '#EEF2FF',
    borderRadius: BorderRadius.xl,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
});
