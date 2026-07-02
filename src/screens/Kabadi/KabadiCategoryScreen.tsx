import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/Types';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { NetworkImage } from '../../components/NetworkImage';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { KABADI_ITEMS } from '../../constants/MockData';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function KabadiCategoryScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Sell Scrap (Kabadi)" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.categoryGrid}>
          {KABADI_ITEMS.map((item) => (
            <Pressable 
              key={item.id} 
              style={styles.categoryCard}
              onPress={() => navigation.navigate('KabadiSubCategory', { 
                categoryId: item.id, 
                categoryName: item.title 
              })}
            >
              <View style={styles.imageContainer}>
                <NetworkImage source={{ uri: item.icon }} style={styles.image} resizeMode="cover" />
              </View>
              <Typography variant="body2" weight="700" style={styles.categoryTitle} numberOfLines={2}>
                {item.title}
              </Typography>
            </Pressable>
          ))}
        </View>

        <View style={styles.infoBox}>
           <Typography variant="body2" color={Colors.light.textSecondary} style={{ textAlign: 'center' }}>
              Select a category to see items and prices. We pick up at your doorstep with digital weighing.
           </Typography>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.surface },
  content: { padding: Spacing.md, paddingBottom: 100 },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: Colors.light.white,
    borderRadius: 16,
    overflow: 'hidden',
    ...Shadows.light.sm,
    marginBottom: Spacing.sm,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  categoryTitle: { textAlign: 'center', color: Colors.light.text, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xs },
  infoBox: {
    marginTop: Spacing.xl,
    padding: Spacing.xl,
    backgroundColor: Colors.light.primaryLight,
    borderRadius: BorderRadius.xl,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
});
