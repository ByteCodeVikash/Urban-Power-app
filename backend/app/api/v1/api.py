from fastapi import APIRouter
from app.api.v1 import (
    auth, users, services, bookings, addresses, geocoding,
    scrap, beautician, maintenance, media, payments,
    scrap_bookings, maintenance_bookings, admin_orders,
    admin,
)

api_router = APIRouter()

# Include versioned sub-routers
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(services.router)
api_router.include_router(bookings.router)
api_router.include_router(addresses.router)
api_router.include_router(geocoding.router)
api_router.include_router(scrap.router)
api_router.include_router(beautician.router)
api_router.include_router(maintenance.router)
api_router.include_router(media.router)
api_router.include_router(payments.router)
api_router.include_router(scrap_bookings.router)
api_router.include_router(maintenance_bookings.router)

# Admin-only order management (no user impersonation — uses admin JWT directly)
api_router.include_router(admin_orders.router)
api_router.include_router(admin.router)





