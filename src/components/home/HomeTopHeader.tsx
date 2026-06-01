import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeBrandHeader } from './HomeBrandHeader';
import { HomeQuickActions } from './HomeQuickActions';

/** Fixed home header: logo + search on top, quick actions (Shopping, Grocery, Kabadi, Cart) below. */
export function HomeTopHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingTop: Math.max(insets.top, 10) }]}>
      <HomeBrandHeader />
      <HomeQuickActions />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
});
