import React from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, Pressable, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/Types';
import { Typography } from '../../components/Typography';
import { Header } from '../../components/Header';
import { NetworkImage } from '../../components/NetworkImage';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { OFFERS } from '../../constants/MockData';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function OffersScreen() {
  const navigation = useNavigation<NavigationProp>();

  const renderItem = ({ item }: any) => (
    <Pressable 
      style={styles.offerCard}
      onPress={() => {
          // Navigate to a generic detail or just show the offer
          // For now, let's just go back or stay here as it's a list
      }}
    >
      <NetworkImage source={{ uri: item.image }} style={styles.offerImage} resizeMode="cover" />
      <View style={styles.offerDetails}>
        <Typography variant="h4" weight="900" color={Colors.light.text}>
          {item.title}
        </Typography>
        <Typography variant="body2" color={Colors.light.primary} weight="700" style={{ marginTop: 4 }}>
          {item.subtitle}
        </Typography>
        <View style={styles.claimBadge}>
          <Typography variant="tiny" weight="900" color={Colors.light.white}>
            CLAIM NOW
          </Typography>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Deals For You" showBack />
      
      <FlatList
        data={OFFERS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerBox}>
            <Typography variant="h3" weight="900" align="center">
              Exclusive Offers 🎁
            </Typography>
            <Typography variant="body2" color={Colors.light.textSecondary} align="center" style={{ marginTop: 4 }}>
              Handpicked deals just for your needs
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
  headerBox: {
    padding: Spacing.xl,
    backgroundColor: Colors.light.white,
    marginBottom: Spacing.lg,
    ...Shadows.light.sm,
  },
  offerCard: {
    backgroundColor: Colors.light.white,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    ...Shadows.light.md,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  offerImage: {
    width: '100%',
    height: 180,
  },
  offerDetails: {
    padding: Spacing.xl,
  },
  claimBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginTop: 12,
  },
});
