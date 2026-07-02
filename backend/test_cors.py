from fastapi.testclient import TestClient
from app.main import app

def test_cors_allowed_origins():
    client = TestClient(app)
    
    # Test allowed origins
    allowed_origins = [
        "http://localhost:3000",
        "http://localhost:8081",
        "http://localhost:19006",
        "exp://some-expo-app-development-id",
    ]
    
    for origin in allowed_origins:
        headers = {
            "Origin": origin,
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Content-Type",
        }
        response = client.options("/", headers=headers)
        assert response.status_code == 200, f"Expected 200 for {origin}, got {response.status_code}"
        assert response.headers.get("access-control-allow-origin") == origin, f"Origin {origin} not allowed"
        assert response.headers.get("access-control-allow-credentials") == "true"
        print(f"PASS: Allowed origin preflight: {origin}")

def test_cors_blocked_origins():
    client = TestClient(app)
    
    # Test blocked origins
    blocked_origins = [
        "http://localhost:4000",
        "https://example.com",
        "https://attacker.com",
        "exp.baddomain.com",
    ]
    
    for origin in blocked_origins:
        headers = {
            "Origin": origin,
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Content-Type",
        }
        response = client.options("/", headers=headers)
        # For non-matching preflight requests, FastAPI/Starlette either returns 400 Bad Request or does not return CORS headers.
        if response.status_code == 200:
            assert "access-control-allow-origin" not in response.headers, f"Blocked origin {origin} was allowed"
        print(f"PASS: Blocked origin preflight: {origin}")

if __name__ == "__main__":
    test_cors_allowed_origins()
    test_cors_blocked_origins()
    print("All CORS middleware tests passed successfully!")
