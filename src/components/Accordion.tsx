import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withTiming,
  useSharedValue,
  useDerivedValue,
  interpolate,
} from 'react-native-reanimated';
import { ChevronDown } from 'lucide-react-native';
import { Typography } from './Typography';
import { Colors, Spacing } from '../constants/Theme';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = React.memo(({ title, children }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Height trick: layout is caught by state or we just use opacity + max-height
  // Reanimated 3 supports auto height animation via Layout animations, but we will 
  // do a safe scale/opacity and dynamic padding.
  const progress = useDerivedValue(() => 
    expanded ? withTiming(1) : withTiming(0)
  );

  const bodyStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      maxHeight: interpolate(progress.value, [0, 1], [0, 1000]), // hacky flexible height
      paddingTop: interpolate(progress.value, [0, 1], [0, Spacing.md]),
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${interpolate(progress.value, [0, 1], [0, 180])}deg` }],
    };
  });

  return (
    <View style={styles.container}>
      <Pressable 
        style={styles.header} 
        onPress={() => setExpanded(!expanded)}
      >
        <Typography variant="h4" weight="600">{title}</Typography>
        <Animated.View style={iconStyle}>
          <ChevronDown color={Colors.light.textSecondary} size={24} />
        </Animated.View>
      </Pressable>
      
      <Animated.View style={[styles.body, bodyStyle]}>
        {children}
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  body: {
    paddingBottom: Spacing.md,
  },
});
