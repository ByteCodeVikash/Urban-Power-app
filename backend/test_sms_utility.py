import sys
import os
import pytest

# Add current directory to path to allow importing app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.sms import send_sms

# Setup a pytest-asyncio marker to mark all test functions in this module as async
pytestmark = pytest.mark.asyncio

async def test_send_sms_simulated():
    # Call send_sms which is now always simulated/mocked
    result = await send_sms("919999999999", "Hello World")
    
    # Verify it succeeds immediately and returns True
    assert result is True
