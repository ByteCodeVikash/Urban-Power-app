import React from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import MapView, { Marker, MapViewProps, Region } from 'react-native-maps';
import { Colors } from '../constants/Theme';
import { Typography } from './Typography';
import { MapPin } from 'lucide-react-native';

export const DEFAULT_REGION: Region = {
  latitude: 12.9716,
  longitude: 77.5946,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};

export interface MapProps extends Omit<
  MapViewProps,
  'region' | 'initialRegion'
> {
  region?: Region;
  initialRegion?: Region;
  containerStyle?: ViewStyle;
  markerCoordinate?: { latitude: number; longitude: number };
  markerTitle?: string;
  markerDescription?: string;
  showCenterPin?: boolean;
}

export const Map = React.forwardRef<any, MapProps>(
  (
    {
      region,
      initialRegion = DEFAULT_REGION,
      containerStyle,
      markerCoordinate,
      markerTitle,
      markerDescription,
      showCenterPin = false,
      style,
      ...restProps
    },
    ref,
  ) => {
    const mapRef = React.useRef<any>(null);
    const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    const useMock = Platform.OS === 'web' || !key;

    React.useImperativeHandle(ref, () => ({
      animateToRegion: (r: Region, duration?: number) => {
        if (!useMock && mapRef.current) {
          mapRef.current.animateToRegion(r, duration);
        } else {
          console.log('Mock animateToRegion:', r);
        }
      },
      fitToCoordinates: (coordinates: { latitude: number; longitude: number }[], options: any) => {
        if (!useMock && mapRef.current) {
          mapRef.current.fitToCoordinates(coordinates, options);
        } else {
          console.log('Mock fitToCoordinates');
        }
      },
    }));

    if (useMock) {
      const displayRegion = region || initialRegion;
      return (
        <View style={[styles.webContainer, containerStyle]}>
          <View style={styles.webMapMock}>
            <MapPin size={40} color={Colors.light.primary} />
            <Typography variant="body1" weight="700" style={styles.webText}>
              Map View (Simulation Mode)
            </Typography>
            <Typography
              variant="body2"
              color={Colors.light.textSecondary}
              align="center"
            >
              Latitude: {displayRegion.latitude.toFixed(6)}, Longitude:{' '}
              {displayRegion.longitude.toFixed(6)}
            </Typography>
            <Typography
              variant="caption"
              color={Colors.light.textMuted}
              align="center"
              style={{ marginTop: 8 }}
            >
              {Platform.OS === 'web'
                ? 'Interactive maps are optimized for mobile platforms.'
                : 'Google Maps API key not configured. Using interactive fallback.'}
            </Typography>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.container, containerStyle]}>
        <MapView
          ref={mapRef}
          region={region}
          initialRegion={initialRegion}
          style={[styles.map, style]}
          loadingEnabled={true}
          loadingIndicatorColor={Colors.light.primary}
          loadingBackgroundColor={Colors.light.surface}
          {...restProps}
        >
          {markerCoordinate && (
            <Marker
              coordinate={markerCoordinate}
              title={markerTitle}
              description={markerDescription}
              pinColor={Colors.light.primary}
            />
          )}
        </MapView>

        {showCenterPin && (
          <View style={styles.centerPinContainer} pointerEvents="none">
            <View style={styles.pinWrapper}>
              <MapPin
                size={36}
                color={Colors.light.primary}
                fill={Colors.light.primaryLight}
              />
              <View style={styles.pinShadow} />
            </View>
          </View>
        )}
      </View>
    );
  },
);

Map.displayName = 'Map';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  centerPinContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -18 }], // Adjust up so point of pin aligns with center
  },
  pinShadow: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginTop: 2,
    transform: [{ scaleX: 2 }],
  },
  webContainer: {
    flex: 1,
    backgroundColor: Colors.light.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  webMapMock: {
    width: '100%',
    height: '100%',
    minHeight: 250,
    backgroundColor: Colors.light.white,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  webText: {
    marginTop: 12,
    marginBottom: 4,
    color: Colors.light.text,
  },
});
