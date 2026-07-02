import sys
import os
import pytest
from pydantic import ValidationError

# Add current directory to path to allow importing app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import Settings

def test_msg91_config_empty():
    # If all MSG91 config options are empty, it should validate successfully
    settings = Settings(
        MSG91_AUTH_KEY="",
        MSG91_TEMPLATE_ID="",
        MSG91_SENDER_ID=""
    )
    assert settings.MSG91_AUTH_KEY in ("", None)
    assert settings.MSG91_TEMPLATE_ID in ("", None)
    assert settings.MSG91_SENDER_ID in ("", None)

def test_msg91_config_valid():
    # If all MSG91 config options are provided and valid, it should validate successfully
    settings = Settings(
        MSG91_AUTH_KEY="531432TrNd2G8Ub0Q6a2fcd0cP1",
        MSG91_TEMPLATE_ID="1234567890abcdef",
        MSG91_SENDER_ID="URBPWR"
    )
    assert settings.MSG91_AUTH_KEY == "531432TrNd2G8Ub0Q6a2fcd0cP1"
    assert settings.MSG91_TEMPLATE_ID == "1234567890abcdef"
    assert settings.MSG91_SENDER_ID == "URBPWR"

def test_msg91_config_incomplete():
    # If only some config options are provided, it should raise a ValidationError
    with pytest.raises(ValidationError) as exc_info:
        Settings(
            MSG91_AUTH_KEY="531432TrNd2G8Ub0Q6a2fcd0cP1",
            MSG91_TEMPLATE_ID="",
            MSG91_SENDER_ID=""
        )
    assert "Incomplete MSG91 configuration" in str(exc_info.value)
    assert "MSG91_TEMPLATE_ID" in str(exc_info.value)
    assert "MSG91_SENDER_ID" in str(exc_info.value)

def test_msg91_config_invalid_sender_id():
    # Sender ID must be exactly 6 characters
    with pytest.raises(ValidationError) as exc_info:
        Settings(
            MSG91_AUTH_KEY="531432TrNd2G8Ub0Q6a2fcd0cP1",
            MSG91_TEMPLATE_ID="1234567890abcdef",
            MSG91_SENDER_ID="URBPW" # 5 chars
        )
    assert "MSG91_SENDER_ID must be exactly 6 characters" in str(exc_info.value)

    with pytest.raises(ValidationError) as exc_info:
        Settings(
            MSG91_AUTH_KEY="531432TrNd2G8Ub0Q6a2fcd0cP1",
            MSG91_TEMPLATE_ID="1234567890abcdef",
            MSG91_SENDER_ID="URBPWR1" # 7 chars
        )
    assert "MSG91_SENDER_ID must be exactly 6 characters" in str(exc_info.value)

def test_msg91_config_invalid_auth_key():
    # Auth key must be at least 10 characters
    with pytest.raises(ValidationError) as exc_info:
        Settings(
            MSG91_AUTH_KEY="short",
            MSG91_TEMPLATE_ID="1234567890abcdef",
            MSG91_SENDER_ID="URBPWR"
        )
    assert "MSG91_AUTH_KEY is invalid (too short)" in str(exc_info.value)

def test_msg91_config_invalid_template_id():
    # Template ID must be alphanumeric
    with pytest.raises(ValidationError) as exc_info:
        Settings(
            MSG91_AUTH_KEY="531432TrNd2G8Ub0Q6a2fcd0cP1",
            MSG91_TEMPLATE_ID="invalid-template-id!", # contains non-alphanumeric chars
            MSG91_SENDER_ID="URBPWR"
        )
    assert "MSG91_TEMPLATE_ID must be alphanumeric" in str(exc_info.value)
