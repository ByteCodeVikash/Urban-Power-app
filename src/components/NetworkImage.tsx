import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  ImageProps,
  ImageStyle,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Colors } from '../constants/Theme';

interface NetworkImageProps extends Omit<ImageProps, 'style'> {
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  showLoader?: boolean;
  /**
   * Optional fallback image used if the primary image fails.
   * If omitted, NetworkImage uses a built-in generic fallback URL.
   */
  fallbackSource?: ImageProps['source'];
}

export const NetworkImage: React.FC<NetworkImageProps> = ({
  source,
  style,
  containerStyle,
  showLoader = false,
  fallbackSource,
  ...props
}) => {
  const builtInFallbackSource: ImageProps['source'] = useMemo(
    () => require('../../assets/app_logo.jpeg'),
    [],
  );

  const initialEffectiveSource = useMemo(() => {
    if (!source) {
      return (fallbackSource ?? builtInFallbackSource) as any;
    }
    
    // If it's a local asset (number)
    if (typeof source === 'number') {
      return source;
    }
    
    // If it's an object/array containing a uri
    const anySource: any = source as any;
    if (Array.isArray(anySource)) {
      if (anySource.length > 0 && anySource[0]?.uri) {
        return source;
      }
      return (fallbackSource ?? builtInFallbackSource) as any;
    }
    
    if (anySource && typeof anySource === 'object' && anySource.uri) {
      return source;
    }
    
    return (fallbackSource ?? builtInFallbackSource) as any;
  }, [source, fallbackSource, builtInFallbackSource]);

  const [effectiveSource, setEffectiveSource] = useState<ImageProps['source']>(
    initialEffectiveSource,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fallbackTried, setFallbackTried] = useState(false);

  useEffect(() => {
    setEffectiveSource(initialEffectiveSource);
    setLoading(true);
    setError(false);
    setFallbackTried(false);
  }, [initialEffectiveSource]);

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = () => {
    // Try fallback once, then show placeholder if it also fails.
    if (!fallbackTried) {
      setFallbackTried(true);
      setEffectiveSource((fallbackSource ?? builtInFallbackSource) as any);
      setLoading(true);
      setError(false);
      return;
    }

    setLoading(false);
    setError(true);
  };

  // Safe container style extraction to prevent collapsing containers
  const containerStyleFromStyle = useMemo(() => {
    if (!style) return {};
    const flattened = StyleSheet.flatten(style);
    const {
      width,
      height,
      borderRadius,
      borderTopLeftRadius,
      borderTopRightRadius,
      borderBottomLeftRadius,
      borderBottomRightRadius,
      margin,
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      marginHorizontal,
      marginVertical,
      position,
      top,
      bottom,
      left,
      right,
      flex,
      opacity,
      backgroundColor,
    } = flattened as any;
    
    return {
      width,
      height,
      borderRadius,
      borderTopLeftRadius,
      borderTopRightRadius,
      borderBottomLeftRadius,
      borderBottomRightRadius,
      margin,
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      marginHorizontal,
      marginVertical,
      position,
      top,
      bottom,
      left,
      right,
      flex,
      opacity,
      backgroundColor,
    };
  }, [style]);

  return (
    <View style={[styles.container, containerStyleFromStyle, containerStyle]}>
      {/* Placeholder / Loading State */}
      {(error || (loading && showLoader)) && (
        <View
          style={[
            styles.placeholder,
            style,
            !error && { backgroundColor: 'transparent' },
          ]}
        >
          {showLoader && !error && (
            <ActivityIndicator size="small" color={Colors.light.primary} />
          )}
          {error && (
            <View style={styles.errorContainer}>
              <View style={styles.emptyCircle} />
            </View>
          )}
        </View>
      )}

      {/* Actual Image */}
      {!error && (
        <Image
          {...props}
          source={effectiveSource}
          style={style}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.light.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  errorContainer: {
    opacity: 0.3,
  },
  emptyCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.textMuted,
  },
});

