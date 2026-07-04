import sys
import os
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import httpx

# Add current directory to path to allow importing app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import Settings
from app.core.sms import send_sms

# Setup a pytest-asyncio marker to mark all test functions in this module as async
pytestmark = pytest.mark.asyncio

@patch("app.core.sms.settings")
async def test_send_sms_mock_mode(mock_settings):
    # Configure mock settings
    mock_settings.SMS_MOCK = True
    
    # Call send_sms
    result = await send_sms("919999999999", "Hello World")
    
    # Verify it succeeds immediately without making external HTTP requests
    assert result is True


@patch("app.core.sms.settings")
async def test_send_sms_config_missing(mock_settings):
    # Configure mock settings with missing config
    mock_settings.SMS_MOCK = False
    mock_settings.MSG91_AUTH_KEY = None
    mock_settings.MSG91_TEMPLATE_ID = "1234567890abcdef"
    mock_settings.MSG91_SENDER_ID = "URBPWR"
    
    result = await send_sms("919999999999", "Hello World")
    assert result is False


@patch("app.core.sms.get_http_client", new_callable=AsyncMock)
@patch("app.core.sms.settings")
async def test_send_sms_http_success(mock_settings, mock_get_client):
    # Configure settings
    mock_settings.SMS_MOCK = False
    mock_settings.MSG91_AUTH_KEY = "531432TrNd2G8Ub0Q6a2fcd0cP1"
    mock_settings.MSG91_TEMPLATE_ID = "1234567890abcdef"
    mock_settings.MSG91_SENDER_ID = "URBPWR"
    
    # Mock HTTP client and response
    mock_client = AsyncMock()
    mock_get_client.return_value = mock_client
    
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"type": "success", "message": "Flow sent successfully"}
    mock_client.post.return_value = mock_response
    
    # Call send_sms
    result = await send_sms("919999999999", "Hello World")
    assert result is True
    
    # Verify post was called with correct arguments
    mock_client.post.assert_called_once()
    args, kwargs = mock_client.post.call_args
    assert args[0] == "https://control.msg91.com/api/v5/flow/"
    assert kwargs["headers"] == {
        "authkey": "531432TrNd2G8Ub0Q6a2fcd0cP1",
        "content-type": "application/json"
    }
    assert kwargs["json"] == {
        "template_id": "1234567890abcdef",
        "sender": "URBPWR",
        "recipients": [
            {
                "mobiles": "919999999999",
                "message": "Hello World"
            }
        ]
    }


@patch("app.core.sms.get_http_client", new_callable=AsyncMock)
@patch("app.core.sms.settings")
async def test_send_sms_api_error_response(mock_settings, mock_get_client):
    # Configure settings
    mock_settings.SMS_MOCK = False
    mock_settings.MSG91_AUTH_KEY = "531432TrNd2G8Ub0Q6a2fcd0cP1"
    mock_settings.MSG91_TEMPLATE_ID = "1234567890abcdef"
    mock_settings.MSG91_SENDER_ID = "URBPWR"
    
    # Mock HTTP client and response returning a JSON error
    mock_client = AsyncMock()
    mock_get_client.return_value = mock_client
    
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"type": "error", "message": "Invalid Auth Key"}
    mock_client.post.return_value = mock_response
    
    result = await send_sms("919999999999", "Hello World")
    assert result is False


@patch("app.core.sms.get_http_client", new_callable=AsyncMock)
@patch("app.core.sms.settings")
async def test_send_sms_http_status_error(mock_settings, mock_get_client):
    # Configure settings
    mock_settings.SMS_MOCK = False
    mock_settings.MSG91_AUTH_KEY = "531432TrNd2G8Ub0Q6a2fcd0cP1"
    mock_settings.MSG91_TEMPLATE_ID = "1234567890abcdef"
    mock_settings.MSG91_SENDER_ID = "URBPWR"
    
    # Mock HTTP client throwing status error
    mock_client = AsyncMock()
    mock_get_client.return_value = mock_client
    
    mock_response = MagicMock()
    mock_response.status_code = 401
    mock_response.text = "Unauthorized"
    
    mock_request = httpx.Request("POST", "https://control.msg91.com/api/v5/flow/")
    exc = httpx.HTTPStatusError("Unauthorized", request=mock_request, response=mock_response)
    mock_client.post.side_effect = exc
    
    result = await send_sms("919999999999", "Hello World")
    assert result is False


@patch("app.core.sms.get_http_client", new_callable=AsyncMock)
@patch("app.core.sms.settings")
async def test_send_sms_timeout_error(mock_settings, mock_get_client):
    # Configure settings
    mock_settings.SMS_MOCK = False
    mock_settings.MSG91_AUTH_KEY = "531432TrNd2G8Ub0Q6a2fcd0cP1"
    mock_settings.MSG91_TEMPLATE_ID = "1234567890abcdef"
    mock_settings.MSG91_SENDER_ID = "URBPWR"
    
    # Mock HTTP client throwing timeout error
    mock_client = AsyncMock()
    mock_get_client.return_value = mock_client
    
    mock_request = httpx.Request("POST", "https://control.msg91.com/api/v5/flow/")
    exc = httpx.TimeoutException("Connection timed out", request=mock_request)
    mock_client.post.side_effect = exc
    
    result = await send_sms("919999999999", "Hello World")
    assert result is False


@patch("app.core.sms.get_http_client", new_callable=AsyncMock)
@patch("app.core.sms.settings")
async def test_send_sms_generic_exception(mock_settings, mock_get_client):
    # Configure settings
    mock_settings.SMS_MOCK = False
    mock_settings.MSG91_AUTH_KEY = "531432TrNd2G8Ub0Q6a2fcd0cP1"
    mock_settings.MSG91_TEMPLATE_ID = "1234567890abcdef"
    mock_settings.MSG91_SENDER_ID = "URBPWR"
    
    # Mock HTTP client throwing generic exception
    mock_client = AsyncMock()
    mock_get_client.return_value = mock_client
    mock_client.post.side_effect = ValueError("Some unexpected error")
    
    result = await send_sms("919999999999", "Hello World")
    assert result is False
