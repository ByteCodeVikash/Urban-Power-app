from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.api.deps import get_current_active_user
from app.models.user import User
from app.schemas.geocoding import GeocodeResponse, ReverseGeocodeResponse
from app.services.geocoding import geocoding_service

router = APIRouter(prefix="/geocoding", tags=["geocoding"])

@router.get("/geocode", response_model=GeocodeResponse)
def geocode(
    address: str = Query(..., description="The physical address to geocode"),
    current_user: User = Depends(get_current_active_user)
):
    """
    Resolve a physical address into latitude and longitude coordinates.
    """
    result = geocoding_service.geocode_address(address)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address could not be geocoded. Please check the address format."
        )
    return result

@router.get("/reverse", response_model=ReverseGeocodeResponse)
def reverse_geocode(
    latitude: float = Query(..., description="Latitude coordinate", ge=-90.0, le=90.0),
    longitude: float = Query(..., description="Longitude coordinate", ge=-180.0, le=180.0),
    current_user: User = Depends(get_current_active_user)
):
    """
    Resolve latitude and longitude coordinates into a physical address.
    """
    result = geocoding_service.reverse_geocode_coordinates(latitude, longitude)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coordinates could not be resolved to a physical address."
        )
    return result
