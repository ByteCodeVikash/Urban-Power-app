import React, { useEffect, useMemo, useState } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, ImageProps, ImageStyle, StyleProp, ViewStyle } from 'react-native';
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
    () => ({
      uri: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop',
    }),
    [],
  );

  const initialEffectiveSource = useMemo(() => {
    const anySource: any = source as any;
    const uri: string | undefined = anySource?.uri;
    if (!uri) return (fallbackSource ?? builtInFallbackSource) as any;
    return source;
  }, [source, fallbackSource, builtInFallbackSource]);

  const [effectiveSource, setEffectiveSource] = useState<ImageProps['source']>(initialEffectiveSource);
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

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Placeholder / Loading State */}
      {(loading || error) && (
        <View style={[styles.placeholder, style]}>
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
          style={[
            style,
            loading ? styles.hiddenImage : styles.visibleImage
          ]}
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
  hiddenImage: {
    opacity: 0,
  },
  visibleImage: {
    opacity: 1,
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
  }
});
