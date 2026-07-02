from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_versioning():
    endpoints = ["auth", "users", "services", "bookings"]
    
    with TestClient(app) as client:
        for endpoint in endpoints:
            url = f"/api/v1/{endpoint}"
            print(f"Testing GET {url} ...")
            response = client.get(url)
            assert response.status_code == 200, f"Expected 200 for {url}, got {response.status_code}"
            
            data = response.json()
            assert data["status"] == "active", f"Expected status 'active' in response from {url}"
            assert endpoint.capitalize() in data["message"], f"Expected '{endpoint.capitalize()}' in message, got '{data['message']}'"
            print(f"PASS: {url} -> {data}")

        # Test root endpoint
        response = client.get("/")
        assert response.status_code == 200
        print("PASS: Root status endpoint")

        # Test health endpoint
        response = client.get("/health")
        # Health check should return 200 now since DB and Redis services are active and lifespan is triggered
        print(f"Health check status code: {response.status_code}")
        assert response.status_code == 200
        print("PASS: Health check endpoint")

if __name__ == "__main__":
    test_api_versioning()
    print("All versioned routing tests passed successfully!")
