import sys
import os
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel
from sqlalchemy.exc import SQLAlchemyError

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.exceptions import register_exception_handlers

# Setup dummy FastAPI app and register handlers
test_app = FastAPI()
register_exception_handlers(test_app)

class TestItem(BaseModel):
    name: str
    age: int

@test_app.get("/http-exception")
async def trigger_http_exception():
    raise HTTPException(status_code=403, detail="Forbidden resource")

@test_app.post("/request-validation")
async def trigger_request_validation(item: TestItem):
    return {"message": "success"}

@test_app.get("/pydantic-validation")
async def trigger_pydantic_validation():
    # Attempting to validate invalid data (passing a list to a string/int field)
    # to trigger Pydantic ValidationError
    TestItem(name=[], age="not-an-int")

@test_app.get("/sqlalchemy-error")
async def trigger_sqlalchemy_error():
    raise SQLAlchemyError("Mock database query failure")

@test_app.get("/generic-exception")
async def trigger_generic_exception():
    raise ValueError("Mock unexpected runtime value error")


client = TestClient(test_app, raise_server_exceptions=False)

def test_http_exception_handler():
    print("Testing HTTPException Handler...")
    response = client.get("/http-exception")
    assert response.status_code == 403
    data = response.json()
    assert data["success"] is False
    assert data["error"]["type"] == "HTTPException"
    assert data["error"]["message"] == "Forbidden resource"
    assert data["error"]["code"] == 403
    assert data["detail"] == "Forbidden resource"
    print("PASS: HTTPException Handler")

def test_request_validation_exception_handler():
    print("Testing RequestValidationError Handler...")
    # Send empty body to trigger RequestValidationError
    response = client.post("/request-validation", json={})
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False
    assert data["error"]["type"] == "RequestValidationError"
    assert data["error"]["message"] == "Validation failed"
    assert data["error"]["code"] == 422
    assert isinstance(data["error"]["details"], list)
    assert len(data["error"]["details"]) > 0
    assert data["detail"] == data["error"]["details"]
    print("PASS: RequestValidationError Handler")

def test_pydantic_validation_exception_handler():
    print("Testing ValidationError Handler...")
    response = client.get("/pydantic-validation")
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False
    assert data["error"]["type"] == "ValidationError"
    assert data["error"]["message"] == "Schema validation failed"
    assert data["error"]["code"] == 422
    assert isinstance(data["error"]["details"], list)
    assert len(data["error"]["details"]) > 0
    assert data["detail"] == data["error"]["details"]
    print("PASS: ValidationError Handler")

def test_sqlalchemy_exception_handler():
    print("Testing SQLAlchemyError Handler...")
    response = client.get("/sqlalchemy-error")
    assert response.status_code == 500
    data = response.json()
    assert data["success"] is False
    assert data["error"]["type"] == "DatabaseError"
    assert "Database error occurred" in data["error"]["message"]
    assert data["error"]["code"] == 500
    assert data["detail"] == data["error"]["message"]
    print("PASS: SQLAlchemyError Handler")

def test_generic_exception_handler():
    print("Testing Generic Exception Handler...")
    response = client.get("/generic-exception")
    assert response.status_code == 500
    data = response.json()
    assert data["success"] is False
    assert data["error"]["type"] == "InternalServerError"
    assert "unexpected error occurred" in data["error"]["message"]
    assert data["error"]["code"] == 500
    assert data["detail"] == data["error"]["message"]
    print("PASS: Generic Exception Handler")

if __name__ == "__main__":
    test_http_exception_handler()
    test_request_validation_exception_handler()
    test_pydantic_validation_exception_handler()
    test_sqlalchemy_exception_handler()
    test_generic_exception_handler()
    print("All centralized exception handling tests passed successfully!")
