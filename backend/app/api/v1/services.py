from fastapi import APIRouter

router = APIRouter(prefix="/services", tags=["services"])

@router.get("/")
async def get_services_status():
    return {
        "status": "active",
        "message": "Services API v1 endpoint is functional."
    }
