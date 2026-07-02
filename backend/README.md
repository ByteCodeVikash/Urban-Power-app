# Urban Power - FastAPI Backend

This is the brand-new FastAPI + PostgreSQL backend skeleton for the Urban Power application, replacing the old Spring Boot backend.

## Prerequisites

- Python 3.11+
- PostgreSQL database (or Docker)

## Local Development Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Database & Environment Setup:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Start the Dockerized PostgreSQL database service:
   ```bash
   docker-compose up -d
   ```
   This starts PostgreSQL on port `5435` to avoid conflicts. You can verify the database connection using:
   ```bash
   python test_connection.py
   ```

5. **Run the Application:**
   Start the development server (configured to port `8081` to match the frontend config):
   ```bash
   uvicorn app.main:app --reload --port 8081
   ```

   The API will be available at `http://localhost:8081`.
   You can view interactive documentation at `http://localhost:8081/docs` or `http://localhost:8081/redoc`.

## Docker Setup

To build and run using Docker:

```bash
docker build -t urban-power-backend .
docker run -p 8081:8081 --env-file .env urban-power-backend
```

## Production Deployment (Nginx Reverse Proxy)

For production deployment on Ubuntu, we run the FastAPI application under systemd and configure Nginx as a reverse proxy on port 80.

An automation script `setup_nginx_proxy.sh` is provided in the project root directory. To run it:

```bash
sudo ./setup_nginx_proxy.sh
```

### Manual Configuration Steps:

1. **FastAPI Systemd Service (`/etc/systemd/system/urban-power-backend.service`):**
   ```ini
   [Unit]
   Description=Urban Power FastAPI Backend Service
   After=network.target

   [Service]
   User=vikash
   WorkingDirectory=/media/H-Drive/Project/shivam_project/urban-power-app-project-updated/backend
   ExecStart=/media/H-Drive/Project/shivam_project/urban-power-app-project-updated/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8081 --workers 2
   Restart=always
   RestartSec=5
   Environment="PATH=/media/H-Drive/Project/shivam_project/urban-power-app-project-updated/backend/venv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

   [Install]
   WantedBy=multi-user.target
   ```

2. **Nginx Server Block Configuration (`/etc/nginx/sites-available/urban-power-backend`):**
   ```nginx
   server {
       listen 80;
       server_name localhost _;

       client_max_body_size 50M;

       location / {
           proxy_pass http://127.0.0.1:8081;
           proxy_http_version 1.1;
           proxy_set_header Host $http_host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

## Redis Configuration & Usage

The application uses Redis as an in-memory database cache. It stores One-Time Passwords (OTPs) during login flows, manages temporary user session storage, and caches generic serializable application data.

### 1. Redis Setup Instructions

Depending on your environment, you can install Redis using one of the following methods:

#### Local Installation (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install redis-server -y
```

#### Docker Setup
If you prefer running Redis inside a Docker container, execute:
```bash
docker run -d --name urban-power-redis -p 6379:6379 redis:alpine
```

### 2. Environment Variables

To configure Redis connectivity, update the following keys in your `.env` file (refer to `.env.example`):

| Variable | Default Value | Description |
|---|---|---|
| `REDIS_HOST` | `localhost` | Hostname/IP address of the Redis server. |
| `REDIS_PORT` | `6379` | Port number the Redis server is listening on. |
| `REDIS_DB` | `0` | Redis database index to use (typically `0`). |

### 3. Redis Startup & Status Verification

#### Managing Local System Service
```bash
# Start Redis server
sudo systemctl start redis-server

# Enable Redis server to run automatically on system boot
sudo systemctl enable redis-server

# Check Redis service status
sudo systemctl status redis-server
```

#### Verifying Connectivity Manually
You can ping the Redis server to verify it is responsive:
```bash
redis-cli ping
# Expected response: PONG
```

### 4. Testing Instructions

The backend repository includes test scripts to verify both synchronous and asynchronous Redis operations as well as caching helper utilities. Ensure your virtual environment is active before running them:

```bash
# 1. Run Synchronous Redis Operations and OTP/Session Flow Tests
python test_redis_connection.py

# 2. Run Asynchronous Redis Connection and Basic Operations Tests
python test_async_redis.py

# 3. Run Generic Cache Utilities Tests (Both Sync & Async)
python test_cache_utilities.py
```

All tests should execute and print `All ... tests passed successfully!` with no failures.

### 5. Cache Architecture & Usage Explanation

The application logic interacts with Redis through wrapper utilities defined in [redis.py](file:///media/H-Drive/Project/shivam_project/urban-power-app-project-updated/backend/app/core/redis.py).

#### OTP Storage and Replay Prevention
- **Storage**: When an OTP is requested for a phone number or email, it is cached in Redis with the key format `otp:{phone_or_email}`.
- **Expiration (TTL)**: OTP keys have a default expiration time of 300 seconds (5 minutes) to ensure security.
- **Replay Prevention**: Upon successful OTP verification, the OTP key is automatically deleted from Redis. This prevents the same OTP from being used multiple times.

#### Temporary Session Storage
- **Session Caching**: Temporary session profiles are cached as JSON-serialized strings using the key format `session:{session_id}`.
- **Expiration (TTL)**: Session keys expire by default after 3600 seconds (1 hour) to free up memory resources automatically.

#### Lifespan Integration
- On backend startup (`app/main.py`), the asynchronous `RedisConnectionManager` initializes a connection pool and pings the Redis instance.
- On backend shutdown, the lifespan context manager ensures the connection pool is gracefully closed, preventing any memory leaks.

#### Generic Caching Utilities
Helper methods automatically serialize Python datatypes (dictionaries, lists, strings) to JSON strings on storage, and deserialize them on retrieval.
- **Synchronous Cache Helpers**: `cache_set`, `cache_get`, `cache_delete`, `cache_exists`
- **Asynchronous Cache Helpers**: `cache_set_async`, `cache_get_async`, `cache_delete_async`, `cache_exists_async`

#### Python Code Usage Examples

Here are some examples of how to use these helpers in your application code:

##### Synchronous Caching & OTP Flow
```python
from app.core.redis import set_otp, verify_otp, cache_set, cache_get

# 1. Storing and verifying OTP
set_otp("9999999999", "1234", expire_seconds=300)
is_valid = verify_otp("9999999999", "1234")  # Returns True and deletes key by default

# 2. Caching generic serializable data
cache_set("services_list", [{"id": 1, "name": "Cleaning"}], expire_seconds=600)
cached_data = cache_get("services_list")
```

##### Asynchronous Caching (FastAPI Endpoints)
```python
from app.core.redis import cache_set_async, cache_get_async

async def get_service_details(service_id: int):
    cache_key = f"service:{service_id}"
    
    # Try fetching from cache
    cached_details = await cache_get_async(cache_key)
    if cached_details:
        return cached_details
        
    # Fetch from database if not cached, then store in Redis
    details = await fetch_from_db(service_id)
    await cache_set_async(cache_key, details, expire_seconds=1800)
    return details
```



