import logging
import requests
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

class GeocodingService:
    """
    Service to handle Geocoding (Address -> Coordinates) and 
    Reverse Geocoding (Coordinates -> Address) using Google Maps API.
    """

    def __init__(self):
        self.base_url = "https://maps.googleapis.com/maps/api/geocode/json"

    def _get_api_key(self) -> Optional[str]:
        # Fallback to Firebase API Key if GOOGLE_MAPS_API_KEY is not defined
        return settings.GOOGLE_MAPS_API_KEY or settings.FIREBASE_API_KEY

    def _should_mock(self) -> bool:
        return settings.GOOGLE_MAPS_MOCK or not self._get_api_key()

    def geocode_address(self, address: str) -> Optional[Dict[str, Any]]:
        """
        Convert address to latitude and longitude coordinates.
        Returns a dictionary containing latitude, longitude, and formatted_address.
        """
        if not address or not address.strip():
            logger.warning("Empty address provided to geocoding service")
            return None

        if self._should_mock():
            logger.info(f"Using mock geocoding for address: {address}")
            return self._mock_geocode(address)

        api_key = self._get_api_key()
        try:
            response = requests.get(
                self.base_url,
                params={"address": address, "key": api_key},
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            status = data.get("status")
            if status == "OK" and data.get("results"):
                result = data["results"][0]
                location = result["geometry"]["location"]
                return {
                    "latitude": float(location["lat"]),
                    "longitude": float(location["lng"]),
                    "formatted_address": result.get("formatted_address", address),
                    "success": True
                }
            else:
                logger.error(f"Google Geocoding API returned non-OK status: {status}. Response: {data}")
                return None
        except requests.RequestException as e:
            logger.exception(f"HTTP error connecting to Google Geocoding API: {e}")
            return None
        except Exception as e:
            logger.exception(f"Unexpected error in geocode_address: {e}")
            return None

    def reverse_geocode_coordinates(self, latitude: float, longitude: float) -> Optional[Dict[str, Any]]:
        """
        Convert latitude and longitude coordinates to a physical address and its components.
        Returns a dictionary containing formatted_address, street, city, state, and pincode.
        """
        # Validate coordinates ranges
        if not -90.0 <= latitude <= 90.0 or not -180.0 <= longitude <= 180.0:
            logger.warning(f"Invalid coordinates range provided: lat={latitude}, lng={longitude}")
            return None

        if self._should_mock():
            logger.info(f"Using mock reverse geocoding for coords: lat={latitude}, lng={longitude}")
            return self._mock_reverse_geocode(latitude, longitude)

        api_key = self._get_api_key()
        try:
            response = requests.get(
                self.base_url,
                params={"latlng": f"{latitude},{longitude}", "key": api_key},
                timeout=10
            )
            response.raise_for_status()
            data = response.json()

            status = data.get("status")
            if status == "OK" and data.get("results"):
                result = data["results"][0]
                
                # Parse address components
                street = None
                sublocality = None
                city = None
                state = None
                pincode = None

                for component in result.get("address_components", []):
                    types = component.get("types", [])
                    if "route" in types:
                        street = component.get("long_name")
                    elif "sublocality" in types or "sublocality_level_1" in types or "neighborhood" in types:
                        if not sublocality: # Grab the most specific one first
                            sublocality = component.get("long_name")
                    elif "locality" in types:
                        city = component.get("long_name")
                    elif "administrative_area_level_1" in types:
                        state = component.get("long_name")
                    elif "postal_code" in types:
                        pincode = component.get("long_name")

                # Fallback heuristics
                if not street:
                    street = sublocality

                if not city:
                    for component in result.get("address_components", []):
                        types = component.get("types", [])
                        if "administrative_area_level_2" in types:
                            city = component.get("long_name")
                            break

                return {
                    "formatted_address": result.get("formatted_address", ""),
                    "street": street,
                    "city": city,
                    "state": state,
                    "pincode": pincode,
                    "success": True
                }
            else:
                logger.error(f"Google Reverse Geocoding API returned non-OK status: {status}. Response: {data}")
                return None
        except requests.RequestException as e:
            logger.exception(f"HTTP error connecting to Google Reverse Geocoding API: {e}")
            return None
        except Exception as e:
            logger.exception(f"Unexpected error in reverse_geocode_coordinates: {e}")
            return None

    def _mock_geocode(self, address: str) -> Dict[str, Any]:
        """
        Provide deterministic mock geocoding results for testing.
        """
        addr_lower = address.lower()
        
        # Match cities deterministically
        if "mumbai" in addr_lower:
            lat, lng = 19.0760, 72.8777
            formatted = "Mumbai, Maharashtra, India"
        elif "pune" in addr_lower:
            lat, lng = 18.5204, 73.8567
            formatted = "Pune, Maharashtra, India"
        elif "delhi" in addr_lower:
            lat, lng = 28.6139, 77.2090
            formatted = "New Delhi, Delhi, India"
        elif "bangalore" in addr_lower or "bengaluru" in addr_lower:
            lat, lng = 12.9716, 77.5946
            formatted = "Bengaluru, Karnataka, India"
        elif "chennai" in addr_lower:
            lat, lng = 13.0827, 80.2707
            formatted = "Chennai, Tamil Nadu, India"
        else:
            # Default to Mumbai if no city matches
            lat, lng = 19.0760, 72.8777
            formatted = f"{address.strip()}, India (Mock Coordinates)"

        return {
            "latitude": lat,
            "longitude": lng,
            "formatted_address": formatted,
            "success": True
        }

    def _mock_reverse_geocode(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """
        Provide deterministic mock reverse geocoding results for testing.
        """
        # Match coordinates regions
        if 19.0 <= latitude <= 20.0 and 72.0 <= longitude <= 73.0:
            return {
                "formatted_address": "12 Main Road, Mumbai, Maharashtra 400001, India",
                "street": "12 Main Road",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400001",
                "success": True
            }
        elif 18.0 <= latitude <= 19.0 and 73.0 <= longitude <= 74.0:
            return {
                "formatted_address": "Other Street, Pune, Maharashtra 411001, India",
                "street": "Other Street",
                "city": "Pune",
                "state": "Maharashtra",
                "pincode": "411001",
                "success": True
            }
        elif 28.0 <= latitude <= 29.0 and 77.0 <= longitude <= 78.0:
            return {
                "formatted_address": "Connaught Place, New Delhi, Delhi 110001, India",
                "street": "Connaught Place",
                "city": "New Delhi",
                "state": "Delhi",
                "pincode": "110001",
                "success": True
            }
        else:
            return {
                "formatted_address": f"Mock Street, Bangalore, Karnataka 560001, India",
                "street": "Mock Street",
                "city": "Bangalore",
                "state": "Karnataka",
                "pincode": "560001",
                "success": True
            }

geocoding_service = GeocodingService()
