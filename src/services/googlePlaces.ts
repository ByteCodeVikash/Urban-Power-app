import axios from 'axios';
import { Platform } from 'react-native';
import * as Location from 'expo-location';

const PLACES_AUTOCOMPLETE_URL =
  'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const PLACE_DETAILS_URL =
  'https://maps.googleapis.com/maps/api/place/details/json';
const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

// Geocoding Cache configuration
interface CacheEntry {
  latitude: number;
  longitude: number;
  address: string;
  timestamp: number;
}

let geocodeCache: CacheEntry[] = [];
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes
const COORD_THRESHOLD = 0.0002; // ~22 meters threshold for cache hits

const getCachedAddress = (lat: number, lng: number): string | null => {
  const now = Date.now();
  // Filter out expired cache entries
  geocodeCache = geocodeCache.filter(
    entry => now - entry.timestamp < CACHE_MAX_AGE,
  );

  for (const entry of geocodeCache) {
    const dLat = entry.latitude - lat;
    const dLng = entry.longitude - lng;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < COORD_THRESHOLD) {
      return entry.address;
    }
  }
  return null;
};

const addAddressToCache = (
  latitude: number,
  longitude: number,
  address: string,
) => {
  if (geocodeCache.length >= 50) {
    geocodeCache.shift();
  }
  geocodeCache.push({
    latitude,
    longitude,
    address,
    timestamp: Date.now(),
  });
};

// Distance-based local mock address helper
const mockLocations = [
  {
    lat: 12.9716,
    lng: 77.5946,
    address: 'Bangalore City Center, Bengaluru, Karnataka, India',
  },
  {
    lat: 12.971899,
    lng: 77.641151,
    address: 'Indiranagar, Bengaluru, Karnataka, India',
  },
  {
    lat: 12.9352,
    lng: 77.6245,
    address: 'Koramangala, Bengaluru, Karnataka, India',
  },
  {
    lat: 12.9698,
    lng: 77.75,
    address: 'Whitefield, Bengaluru, Karnataka, India',
  },
  {
    lat: 12.9308,
    lng: 77.583,
    address: 'Jayanagar, Bengaluru, Karnataka, India',
  },
];

const getMockAddress = (lat: number, lng: number): string => {
  let closest = mockLocations[0];
  let minDist = Infinity;
  for (const loc of mockLocations) {
    const dLat = loc.lat - lat;
    const dLng = loc.lng - lng;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < minDist) {
      minDist = dist;
      closest = loc;
    }
  }

  const distMeters = Math.round(minDist * 111000);
  if (distMeters < 50) {
    return closest.address;
  }

  const baseName = closest.address.split(',')[0];
  const rest = closest.address.substring(baseName.length + 2);
  return `Near ${baseName} (~${(distMeters / 1000).toFixed(1)} km), ${rest}`;
};

const getApiKey = () => {
  return process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';
};

export interface AutocompleteSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export const googlePlacesService = {
  getSuggestions: async (input: string): Promise<AutocompleteSuggestion[]> => {
    const key = getApiKey();
    if (!key) {
      // Mock results for local testing/development when API key is missing
      await new Promise(r => setTimeout(r, 300));
      const mockSuggestions = [
        {
          placeId: 'mock-1',
          description: 'Bangalore City Center, Bengaluru, Karnataka, India',
          mainText: 'Bangalore City Center',
          secondaryText: 'Bengaluru, Karnataka, India',
        },
        {
          placeId: 'mock-2',
          description: 'Indiranagar, Bengaluru, Karnataka, India',
          mainText: 'Indiranagar',
          secondaryText: 'Bengaluru, Karnataka, India',
        },
        {
          placeId: 'mock-3',
          description: 'Koramangala, Bengaluru, Karnataka, India',
          mainText: 'Koramangala',
          secondaryText: 'Bengaluru, Karnataka, India',
        },
        {
          placeId: 'mock-4',
          description: 'Whitefield, Bengaluru, Karnataka, India',
          mainText: 'Whitefield',
          secondaryText: 'Bengaluru, Karnataka, India',
        },
        {
          placeId: 'mock-5',
          description: 'Jayanagar, Bengaluru, Karnataka, India',
          mainText: 'Jayanagar',
          secondaryText: 'Bengaluru, Karnataka, India',
        },
      ];
      return mockSuggestions.filter(item =>
        item.description.toLowerCase().includes(input.toLowerCase()),
      );
    }

    try {
      const response = await axios.get(PLACES_AUTOCOMPLETE_URL, {
        params: {
          input,
          key,
          components: 'country:in', // prioritize India / Bangalore area component
        },
      });

      if (
        response.data.status !== 'OK' &&
        response.data.status !== 'ZERO_RESULTS'
      ) {
        throw new Error(
          response.data.error_message ||
            `Places API status: ${response.data.status}`,
        );
      }

      if (response.data.status === 'ZERO_RESULTS') {
        return [];
      }

      return response.data.predictions.map((p: any) => ({
        placeId: p.place_id,
        description: p.description,
        mainText: p.structured_formatting?.main_text || p.description,
        secondaryText: p.structured_formatting?.secondary_text || '',
      }));
    } catch (error) {
      console.error('Google Places Autocomplete Error:', error);
      throw error;
    }
  },

  getPlaceDetails: async (
    placeId: string,
  ): Promise<{ latitude: number; longitude: number; address: string }> => {
    const key = getApiKey();
    if (!key) {
      // Mock coordinates return
      if (placeId.startsWith('mock-')) {
        const mockCoords: Record<
          string,
          { lat: number; lng: number; address: string }
        > = {
          'mock-1': {
            lat: 12.9716,
            lng: 77.5946,
            address: 'Bangalore City Center, Bengaluru, Karnataka, India',
          },
          'mock-2': {
            lat: 12.971899,
            lng: 77.641151,
            address: 'Indiranagar, Bengaluru, Karnataka, India',
          },
          'mock-3': {
            lat: 12.9352,
            lng: 77.6245,
            address: 'Koramangala, Bengaluru, Karnataka, India',
          },
          'mock-4': {
            lat: 12.9698,
            lng: 77.75,
            address: 'Whitefield, Bengaluru, Karnataka, India',
          },
          'mock-5': {
            lat: 12.9308,
            lng: 77.583,
            address: 'Jayanagar, Bengaluru, Karnataka, India',
          },
        };
        const mock = mockCoords[placeId] || mockCoords['mock-1'];
        return {
          latitude: mock.lat,
          longitude: mock.lng,
          address: mock.address,
        };
      }
      return {
        latitude: 12.9716,
        longitude: 77.5946,
        address: 'Bangalore City Center',
      };
    }

    try {
      const response = await axios.get(PLACE_DETAILS_URL, {
        params: {
          place_id: placeId,
          fields: 'geometry,formatted_address',
          key,
        },
      });

      if (response.data.status !== 'OK') {
        throw new Error(
          response.data.error_message ||
            `Place Details status: ${response.data.status}`,
        );
      }

      const result = response.data.result;
      const location = result.geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
        address: result.formatted_address || '',
      };
    } catch (error) {
      console.error('Google Place Details Error:', error);
      throw error;
    }
  },

  reverseGeocode: async (
    latitude: number,
    longitude: number,
  ): Promise<string> => {
    const cached = getCachedAddress(latitude, longitude);
    if (cached) {
      return cached;
    }

    const key = getApiKey();
    if (key) {
      try {
        const response = await axios.get(GEOCODE_URL, {
          params: {
            latlng: `${latitude},${longitude}`,
            key,
          },
        });

        if (response.data.status === 'OK' && response.data.results.length > 0) {
          const address = response.data.results[0].formatted_address;
          addAddressToCache(latitude, longitude, address);
          return address;
        } else {
          console.warn('Google Geocoding API status:', response.data.status);
        }
      } catch (error) {
        console.error('Google Geocoding API Error:', error);
      }
    }

    if (Platform.OS !== 'web') {
      try {
        const results = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        if (results && results.length > 0) {
          const addr = results[0];
          const street = addr.street || addr.name || '';
          const subregion = addr.subregion || addr.district || '';
          const city = addr.city || '';
          const region = addr.region || '';
          const country = addr.country || '';
          const postalCode = addr.postalCode || '';

          const parts = [
            street,
            subregion,
            city,
            region,
            postalCode,
            country,
          ].filter(p => p && p.trim() !== '');

          const address = parts.join(', ');
          if (address) {
            addAddressToCache(latitude, longitude, address);
            return address;
          }
        }
      } catch (error) {
        console.error('Native Geocoding Error:', error);
      }
    }

    const mockAddr = getMockAddress(latitude, longitude);
    addAddressToCache(latitude, longitude, mockAddr);
    return mockAddr;
  },
};
