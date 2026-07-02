from fastapi import APIRouter
from app.api.v1.api import api_router as v1_router

# Central API Router handling multiple API versions
api_router = APIRouter()

# Include version 1 router
api_router.include_router(v1_router, prefix="/v1")

# Future support for version 2:
# 1. Create a `v2` directory under `app/api/` with its own router.py and endpoints.
# 2. Import it here: `from app.api.v2.router import api_router as v2_router`
# 3. Mount it here: `api_router.include_router(v2_router, prefix="/v2")`
