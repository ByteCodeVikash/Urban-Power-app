import React from 'react';
import { StyleSheet, Pressable, ViewStyle, View } from 'react-native';
import { Search, Camera, Mic, ScanLine } from 'lucide-react-native';
import { Typography } from './Typography';
import { Colors, Spacing, BorderRadius, Shadows } from '../constants/Theme';

interface SearchBarProps {
  onPress?: () => void;
  style?: ViewStyle;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = React.memo(({ onPress, style, placeholder }) => {
  return (
    <Pressable style={[styles.searchBar, style, Shadows.light.md]} onPress={onPress}>
      <Search color={Colors.light.text} size={22} />
      <Typography variant="body2" color={Colors.light.textSecondary} style={styles.placeholder}>
        {placeholder ?? 'Search or ask a question'}
      </Typography>
      <View style={styles.rightIcons}>
        <ScanLine color={Colors.light.textMuted} size={22} style={styles.iconSpaced} />
        <Mic color={Colors.light.textMuted} size={22} style={styles.iconSpaced} />
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    paddingHorizontal: Spacing.lg,
    height: 52,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  placeholder: {
    marginLeft: Spacing.sm,
    flex: 1,
    fontSize: 15,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSpaced: {
    marginLeft: 12,
  },
});
