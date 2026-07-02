import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MapPin, Navigation, Info, Search, X } from 'lucide-react-native';
import { Header } from '../../components/Header';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import { Map, DEFAULT_REGION } from '../../components/Map';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import * as Location from 'expo-location';
import {
  googlePlacesService,
  AutocompleteSuggestion,
} from '../../services/googlePlaces';

export default function MapScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const mapRef = useRef<any>(null);
  const isFromAutocomplete = useRef(false);

  const [currentRegion, setCurrentRegion] = useState(() => {
    if (route.params?.initialLocation) {
      return {
        ...DEFAULT_REGION,
        latitude: route.params.initialLocation.latitude,
        longitude: route.params.initialLocation.longitude,
      };
    }
    return DEFAULT_REGION;
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(() => {
    if (route.params?.initialLocation) {
      return {
        latitude: route.params.initialLocation.latitude,
        longitude: route.params.initialLocation.longitude,
      };
    }
    return null;
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const [gpsDisabled, setGpsDisabled] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Places Autocomplete State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  // Debouncing search requests
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const results = await googlePlacesService.getSuggestions(searchQuery);
        setSuggestions(results);
      } catch (err) {
        console.error('Error fetching autocomplete suggestions:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const requestAndGetLocation = async (isManual = false) => {
    setIsLoadingLocation(true);
    setGpsDisabled(false);
    setHasError(false);
    try {
      if (Platform.OS === 'web') {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            position => {
              const { latitude, longitude } = position.coords;
              const newRegion = {
                latitude,
                longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
              };
              setDetectedLocation({ latitude, longitude });
              setCurrentRegion(newRegion);
              setSelectedAddress(null); // Clear selected address on gps reset
              setIsLoadingLocation(false);
            },
            error => {
              console.warn('Web Geolocation error:', error);
              setHasError(true);
              setIsLoadingLocation(false);
            },
          );
        } else {
          setHasError(true);
          setIsLoadingLocation(false);
        }
        return;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setGpsDisabled(true);
        setIsLoadingLocation(false);
        if (isManual) {
          Alert.alert(
            'GPS Service Disabled',
            'Please enable GPS / location services on your device to detect your location.',
            [{ text: 'OK' }],
          );
        }
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      if (status !== 'granted') {
        setIsLoadingLocation(false);
        if (isManual) {
          Alert.alert(
            'Permission Denied',
            'Location permission is required to detect your current position. Please enable it in device settings.',
            [{ text: 'OK' }],
          );
        }
        return;
      }

      // Fast fallback using last known position
      try {
        const lastKnown = await Location.getLastKnownPositionAsync({});
        if (lastKnown) {
          const { latitude, longitude } = lastKnown.coords;
          const lastRegion = {
            latitude,
            longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          };
          setDetectedLocation({ latitude, longitude });
          setCurrentRegion(lastRegion);
          setSelectedAddress(null);
        }
      } catch (e) {
        console.warn('Could not fetch last known position:', e);
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      };

      setDetectedLocation({ latitude, longitude });
      setCurrentRegion(newRegion);
      setSelectedAddress(null);
    } catch (error) {
      console.error('Error fetching location:', error);
      setHasError(true);
      if (isManual) {
        Alert.alert(
          'Location Error',
          'An error occurred while trying to detect your location. Please try again.',
          [{ text: 'OK' }],
        );
      }
    } finally {
      setIsLoadingLocation(false);
    }
  };

  useEffect(() => {
    if (!route.params?.initialLocation) {
      requestAndGetLocation(false);
    }
  }, []);

  // Reverse geocoding when coordinates change
  useEffect(() => {
    if (isFromAutocomplete.current) {
      isFromAutocomplete.current = false;
      return;
    }

    let isMounted = true;
    const fetchAddress = async () => {
      setIsUpdating(true);
      try {
        const address = await googlePlacesService.reverseGeocode(
          currentRegion.latitude,
          currentRegion.longitude,
        );
        if (isMounted) {
          setSelectedAddress(address);
        }
      } catch (error) {
        console.error('Failed to reverse geocode location:', error);
        if (isMounted) {
          setSelectedAddress(
            prev =>
              prev || 'Unable to resolve address. Please drag map to retry.',
          );
        }
      } finally {
        if (isMounted) {
          setIsUpdating(false);
        }
      }
    };

    fetchAddress();

    return () => {
      isMounted = false;
    };
  }, [currentRegion.latitude, currentRegion.longitude]);

  const handleRegionChangeComplete = (region: any) => {
    setCurrentRegion(region);
    setDetectedLocation({
      latitude: region.latitude,
      longitude: region.longitude,
    });
  };

  const handleSelectSuggestion = async (suggestion: AutocompleteSuggestion) => {
    Keyboard.dismiss();
    setShowSuggestions(false);
    setSearchQuery(suggestion.mainText);
    setIsLoadingLocation(true);

    try {
      const details = await googlePlacesService.getPlaceDetails(
        suggestion.placeId,
      );
      const newRegion = {
        latitude: details.latitude,
        longitude: details.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      };

      isFromAutocomplete.current = true;
      setSelectedAddress(details.address);
      setDetectedLocation({
        latitude: details.latitude,
        longitude: details.longitude,
      });
      setCurrentRegion(newRegion);

      if (mapRef.current) {
        if (Platform.OS !== 'web') {
          mapRef.current.animateToRegion(newRegion, 1000);
        }
      }
    } catch (error) {
      console.error('Error selecting suggestion:', error);
      Alert.alert(
        'Location Error',
        'Unable to fetch details for the selected location.',
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleConfirmLocation = () => {
    const returnScreen = route.params?.returnScreen;
    if (returnScreen) {
      navigation.navigate(returnScreen, {
        latitude: currentRegion.latitude,
        longitude: currentRegion.longitude,
        address: selectedAddress || '',
      });
    } else {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Main');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Set Service Location" showBack />

      <View style={styles.container}>
        <Map
          ref={mapRef}
          region={currentRegion}
          onRegionChangeComplete={handleRegionChangeComplete}
          showCenterPin={true}
          markerCoordinate={detectedLocation || undefined}
          markerTitle="My Detected Location"
        />

        {/* Floating Google Places Autocomplete Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search
              size={20}
              color={Colors.light.textMuted}
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search for area, street, or landmark..."
              placeholderTextColor={Colors.light.textMuted}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={text => {
                setSearchQuery(text);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
            />
            {searchQuery ? (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
                style={styles.clearButton}
              >
                <X size={20} color={Colors.light.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions &&
            (searchQuery.length > 0 || suggestions.length > 0) && (
              <View style={styles.suggestionsContainer}>
                {isSearching ? (
                  <View style={styles.searchLoading}>
                    <ActivityIndicator
                      size="small"
                      color={Colors.light.primary}
                    />
                    <Typography
                      variant="body2"
                      color={Colors.light.textMuted}
                      style={{ marginLeft: Spacing.sm }}
                    >
                      Searching...
                    </Typography>
                  </View>
                ) : suggestions.length === 0 ? (
                  <View style={styles.noResults}>
                    <Typography variant="body2" color={Colors.light.textMuted}>
                      No locations found
                    </Typography>
                  </View>
                ) : (
                  <FlatList
                    data={suggestions}
                    keyExtractor={item => item.placeId}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.suggestionItem}
                        onPress={() => handleSelectSuggestion(item)}
                      >
                        <View style={styles.suggestionIconWrapper}>
                          <MapPin size={18} color={Colors.light.primary} />
                        </View>
                        <View style={styles.suggestionTextWrapper}>
                          <Typography
                            variant="body2"
                            weight="700"
                            color={Colors.light.text}
                          >
                            {item.mainText}
                          </Typography>
                          {item.secondaryText ? (
                            <Typography
                              variant="caption"
                              color={Colors.light.textMuted}
                              style={{ marginTop: 2 }}
                            >
                              {item.secondaryText}
                            </Typography>
                          ) : null}
                        </View>
                      </TouchableOpacity>
                    )}
                    keyboardShouldPersistTaps="handled"
                    style={styles.suggestionsList}
                  />
                )}
              </View>
            )}
        </View>

        {isLoadingLocation && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.light.primary} />
              <Typography
                variant="body2"
                weight="600"
                style={{ marginLeft: Spacing.sm }}
              >
                Locating you...
              </Typography>
            </View>
          </View>
        )}

        {/* Floating Reset Button */}
        <View style={styles.floatingButtonContainer}>
          <Button
            title="Recenter"
            onPress={() => requestAndGetLocation(true)}
            variant="secondary"
            size="sm"
            icon={<Navigation size={16} color={Colors.light.primary} />}
            style={styles.recenterButton}
          />
        </View>

        {/* Premium bottom panel */}
        <View style={styles.bottomCard}>
          <View style={styles.cardIndicator} />

          <View style={styles.locationHeader}>
            <View style={styles.pinCircle}>
              <MapPin size={22} color={Colors.light.primary} />
            </View>
            <View style={styles.locationHeaderDetails}>
              <Typography variant="body1" weight="700">
                {isUpdating ? 'Pinpointing location...' : 'Selected Location'}
              </Typography>
              <Typography variant="caption" color={Colors.light.textMuted}>
                Drag map to adjust details
              </Typography>
            </View>
          </View>

          <View style={styles.addressBox}>
            {gpsDisabled ? (
              <Typography
                variant="body2"
                color={Colors.light.error}
                weight="600"
              >
                GPS / Location Services Disabled
              </Typography>
            ) : permissionStatus === 'denied' ? (
              <Typography
                variant="body2"
                color={Colors.light.error}
                weight="600"
              >
                Location Permission Denied
              </Typography>
            ) : hasError ? (
              <Typography
                variant="body2"
                color={Colors.light.error}
                weight="600"
              >
                Unable to Detect Location
              </Typography>
            ) : (
              <Typography
                variant="body2"
                color={Colors.light.textSecondary}
                style={styles.addressText}
              >
                Latitude: {currentRegion.latitude.toFixed(6)}, Longitude:{' '}
                {currentRegion.longitude.toFixed(6)}
              </Typography>
            )}
            <Typography
              variant="caption"
              color={Colors.light.textMuted}
              style={styles.mockAddress}
            >
              {gpsDisabled
                ? 'Please enable location services (GPS) to fetch your current location.'
                : permissionStatus === 'denied'
                  ? 'Please enable location permission in system settings to locate your device.'
                  : hasError
                    ? 'An error occurred while locating. Please make sure GPS is active and retry.'
                    : selectedAddress ||
                      'Near Bangalore City Center, Bengaluru, Karnataka, India'}
            </Typography>
            {(gpsDisabled || permissionStatus === 'denied' || hasError) && (
              <Button
                title="Retry Location Detection"
                onPress={() => requestAndGetLocation(true)}
                variant="outline"
                size="sm"
                style={styles.retryButton}
              />
            )}
          </View>

          <View style={styles.tipBox}>
            <Info
              size={16}
              color={Colors.light.primary}
              style={styles.tipIcon}
            />
            <Typography
              variant="caption"
              color={Colors.light.textSecondary}
              style={{ flex: 1 }}
            >
              Our technicians will arrive at this exact marked location.
            </Typography>
          </View>

          <Button
            title="Confirm Location"
            onPress={handleConfirmLocation}
            variant="primary"
            size="lg"
            style={styles.confirmBtn}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.white,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  searchContainer: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 30,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.light.sm,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: Colors.light.text,
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  clearButton: {
    padding: Spacing.xs,
  },
  suggestionsContainer: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
    maxHeight: 220,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.light.md,
    overflow: 'hidden',
  },
  suggestionsList: {
    paddingVertical: Spacing.xs,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  suggestionIconWrapper: {
    marginRight: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionTextWrapper: {
    flex: 1,
  },
  searchLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  noResults: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  floatingButtonContainer: {
    position: 'absolute',
    right: Spacing.md,
    top: 80, // Moved below search bar to prevent overlap
    zIndex: 10,
  },
  recenterButton: {
    backgroundColor: Colors.light.white,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.light.sm,
    height: 40,
    borderRadius: BorderRadius.xl,
  },
  bottomCard: {
    backgroundColor: Colors.light.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.lg,
    ...Shadows.light.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  cardIndicator: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.light.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  pinCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  locationHeaderDetails: {
    flex: 1,
  },
  addressBox: {
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  addressText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontWeight: '700',
  },
  mockAddress: {
    marginTop: 4,
    lineHeight: 16,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  tipIcon: {
    marginRight: Spacing.sm,
  },
  confirmBtn: {
    width: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    ...Shadows.light.md,
  },
  retryButton: {
    marginTop: Spacing.sm,
    borderColor: Colors.light.primary,
  },
});
