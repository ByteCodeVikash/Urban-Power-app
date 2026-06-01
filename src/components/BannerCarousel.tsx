import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Dimensions, ViewToken } from 'react-native';
import { NetworkImage } from './NetworkImage';
import { Colors, Spacing, BorderRadius } from '../constants/Theme';

const { width } = Dimensions.get('window');

interface BannerCarouselProps {
  data?: { id: string; image: string }[];
  loading?: boolean;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = React.memo(({ data, loading }) => {
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!data || data?.length <= 1 || loading) return;

    const interval = setInterval(() => {
      let nextIndex = activeIndex + 1;
      if (nextIndex >= data?.length) nextIndex = 0;
      
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 3500);

    return () => clearInterval(interval);
  }, [activeIndex, data, loading]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }).current;

  if (loading || !data) {
    return <View style={[styles.image, { backgroundColor: Colors.light.surface }]} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={data}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        renderItem={({ item }) => (
          item?.image ? (
            <NetworkImage 
              source={typeof item.image === 'string' ? { uri: item.image } : item.image} 
              style={styles.image} 
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.image, { backgroundColor: Colors.light.surface }]} />
          )
        )}
      />
      <View style={styles.pagination}>
        {data.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === activeIndex && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  image: {
    width: width - Spacing.lg * 2,
    height: 180,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.lg,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: Colors.light.white,
    width: 16,
  },
});
