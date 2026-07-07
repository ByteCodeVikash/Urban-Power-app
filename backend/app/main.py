from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import verify_db_connection
from app.core.redis import verify_redis_connection, redis_manager
from app.api.router import api_router
from app.core.exceptions import register_exception_handlers

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Set logger level and add StreamHandler for app package to capture INFO logs
    app_logger = logging.getLogger("app")
    app_logger.setLevel(logging.INFO)
    if not app_logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter("[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s")
        handler.setFormatter(formatter)
        app_logger.addHandler(handler)
    
    # Initialize shared HTTP client
    from app.core.http import http_manager, get_http_client
    http_manager.init_client()

    # Pre-heat HTTP connections to external APIs (Google Identity)
    import asyncio
    async def preheat_connections():
        try:
            client = await get_http_client()
            # Send OPTIONS request to pre-establish TCP+TLS connections
            await client.options("https://identitytoolkit.googleapis.com", timeout=2.0)
            logger.info("Successfully pre-warmed external connection pools (Google Identity).")
        except Exception as preheat_err:
            logger.warning(f"Could not pre-warm external connection pools: {preheat_err}")
    asyncio.create_task(preheat_connections())

    # Verify Database connectivity on startup
    verify_db_connection()

    # Ensure booking_status_history table exists (no migration needed)
    from app.core.database import engine
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS booking_status_history (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    booking_id VARCHAR(64) NOT NULL,
                    booking_type VARCHAR(20) NOT NULL,
                    status VARCHAR(50) NOT NULL,
                    updated_by VARCHAR(64),
                    updated_by_name VARCHAR(255),
                    notes TEXT,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
            """))
            conn.execute(text(
                "CREATE INDEX IF NOT EXISTS idx_bsh_booking_id ON booking_status_history (booking_id)"
            ))
            conn.commit()
        logger.info("booking_status_history table verified/created.")
    except Exception as e:
        logger.warning(f"Could not auto-create booking_status_history table: {e}")

    # Ensure admins table exists
    try:
        with engine.connect() as conn:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS admins (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    username VARCHAR(100) UNIQUE NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    role VARCHAR(50) NOT NULL DEFAULT 'admin',
                    is_active BOOLEAN NOT NULL DEFAULT TRUE,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
            """))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_admins_username ON admins (username)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_admins_email ON admins (email)"))
            conn.commit()
        logger.info("admins table verified/created.")
    except Exception as e:
        logger.warning(f"Could not auto-create admins table: {e}")

    # Seed default Scrap and Beautician data
    from app.core.database import SessionLocal
    from app.core.seeding import seed_scrap_data, seed_beautician_data, seed_maintenance_data
    db = SessionLocal()
    try:
        seed_scrap_data(db)
        seed_beautician_data(db)
        seed_maintenance_data(db)

        # Seed default admin if none exists
        from app.models.admin import Admin
        import bcrypt
        admin_exists = db.query(Admin).first()
        if not admin_exists:
            hashed_pw = bcrypt.hashpw("adminpassword".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            default_admin = Admin(
                username="admin",
                email="admin@urbanpower.com",
                password_hash=hashed_pw,
                role="super_admin",
                is_active=True
            )
            db.add(default_admin)
            db.commit()
            logger.info("Default admin user seeded successfully (admin / adminpassword).")
    except Exception as e:
        logger.error(f"Error during database startup seeding: {e}")
    finally:
        db.close()


    # Initialize and verify async Redis on startup
    redis_manager.init_redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        db=settings.REDIS_DB
    )
    await redis_manager.ping()
    # Verify Redis connectivity on startup
    verify_redis_connection()
    yield
    # Shutdown async Redis connections
    await redis_manager.close()
    # Shutdown shared HTTP client
    await http_manager.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="0.1.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

import re

# Register centralized exception handlers
register_exception_handlers(app)

# Separate exact origins from patterns with wildcards
exact_origins = []
regex_patterns = []

if "*" in settings.BACKEND_CORS_ORIGINS:
    exact_origins = ["*"]
    allow_origin_regex = None
else:
    for origin in settings.BACKEND_CORS_ORIGINS:
        if "*" in origin:
            pattern = re.escape(origin).replace(r"\*", ".*")
            regex_patterns.append(f"^{pattern}$")
        else:
            exact_origins.append(origin)
    allow_origin_regex = "|".join(regex_patterns) if regex_patterns else None

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=exact_origins,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include versioned API router
app.include_router(api_router, prefix="/api")

# Mount local media directory for file uploads
import os
from fastapi.staticfiles import StaticFiles
os.makedirs("media", exist_ok=True)
app.mount("/media", StaticFiles(directory="media"), name="media")

@app.get("/health")
async def health_check():
    """
    Health check endpoint to verify database, Redis, and async Redis connectivity.
    """
    db_healthy = verify_db_connection()
    redis_healthy = verify_redis_connection()
    async_redis_healthy = await redis_manager.ping()
    
    status = "healthy" if db_healthy and redis_healthy and async_redis_healthy else "unhealthy"
    
    response_content = {
        "status": status,
        "services": {
            "database": "connected" if db_healthy else "disconnected",
            "redis": "connected" if redis_healthy else "disconnected",
            "async_redis": "connected" if async_redis_healthy else "disconnected"
        }
    }
    
    if status == "healthy":
        return response_content
    else:
        return JSONResponse(status_code=503, content=response_content)

@app.get("/")
def read_root():
    """
    Root status endpoint.
    """
    return {
        "status": "online",
        "message": f"Welcome to the {settings.PROJECT_NAME} API. Access documentation at /docs",
    }

