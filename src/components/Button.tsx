import React from 'react';
import { StyleSheet, Pressable, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Shadows } from '../constants/Theme';
import { Typography } from './Typography';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ButtonComponent: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  const getHeight = () => {
    switch (size) {
      case 'sm': return 36;
      case 'lg': return 56;
      default: return 48;
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return Colors.light.border;
    if (variant === 'secondary') return Colors.light.primaryLight;
    if (isOutline || variant === 'ghost') return 'transparent';
    return Colors.light.primary;
  };

  const getTextColor = () => {
    if (disabled) return 'rgba(255,255,255,0.6)';
    if (isPrimary) return Colors.light.white;
    return Colors.light.primary;
  };

  const innerContent = (
    <>
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && <Animated.View style={styles.iconContainer}>{icon}</Animated.View>}
          <Typography
            variant={size === 'sm' ? 'body2' : 'body1'}
            weight="800"
            color={getTextColor()}
            style={[{ letterSpacing: 0.8 }, textStyle]}
          >
            {title}
          </Typography>
        </>
      )}
    </>
  );

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.button,
        isPrimary && !disabled && styles.glowShadow,
        isOutline && styles.outline,
        {
          height: getHeight(),
          backgroundColor: isPrimary ? (disabled ? 'rgba(124,58,237,0.3)' : 'transparent') : getBackgroundColor(),
        },
        style,
      ]}
    >
      {isPrimary && !disabled ? (
        <LinearGradient
          colors={['#7C3AED', '#6D28D9']} // Vibrant Electric Purple
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      ) : null}
      {innerContent}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    overflow: 'hidden',
  },
  outline: {
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  glowShadow: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
});
export const Button = React.memo(ButtonComponent);
