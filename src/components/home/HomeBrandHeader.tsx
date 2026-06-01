import React from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search } from 'lucide-react-native';
import { Typography } from '../Typography';
import { Colors, Spacing } from '../../constants/Theme';

export function HomeBrandHeader() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.headerMainRow}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/app_logo.jpeg')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Typography variant="h4" weight="700" color={Colors.light.text} style={styles.logoText}>
          Urban Power
        </Typography>
      </View>

      <Pressable style={styles.searchBar} onPress={() => navigation.navigate('Search')}>
        <Search size={16} color={Colors.light.textMuted} />
        <Typography variant="body2" color={Colors.light.textMuted} style={styles.searchText}>
          Search services...
        </Typography>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  headerMainRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  logoText: {
    letterSpacing: -0.5,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchText: {
    marginLeft: 8,
    fontSize: 13,
  },
});
