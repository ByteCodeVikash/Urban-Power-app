import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Typography } from './Typography';
import { Colors, Spacing } from '../constants/Theme';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = React.memo(({ title, onSeeAll }) => {
  return (
    <View style={styles.container}>
      <Typography variant="h3" weight="700">{title}</Typography>
      {onSeeAll && (
        <Pressable onPress={onSeeAll}>
          <Typography variant="body2" weight="600" color={Colors.light.primary}>
            See All
          </Typography>
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.md,
  },
});
