import logging
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

async def send_sms(phone: str, message: str) -> bool:
    """
    Send an SMS message using MSG91 Flow API.
    If SMS_MOCK is True, simulate the send and log it.
    
    Args:
        phone: Recipient phone number (with country code, e.g. "919999999999")
        message: Message content to send
        
    Returns:
        bool: True if sent successfully (or simulated successfully), False otherwise.
    """
    if settings.SMS_MOCK:
        logger.info(
            "SMS sent (MOCK MODE)",
            extra={
                "phone": phone,
                "message": message,
                "status": "success",
                "mock": True
            }
        )
        return True

    if not settings.MSG91_AUTH_KEY or not settings.MSG91_TEMPLATE_ID or not settings.MSG91_SENDER_ID:
        logger.error(
            "Cannot send SMS: MSG91 is not configured.",
            extra={
                "phone": phone,
                "mock": False,
                "error": "Missing configuration"
            }
        )
        return False

    url = "https://control.msg91.com/api/v5/flow/"
    
    headers = {
        "authkey": settings.MSG91_AUTH_KEY,
        "content-type": "application/json"
    }
    
    payload = {
        "template_id": settings.MSG91_TEMPLATE_ID,
        "sender": settings.MSG91_SENDER_ID,
        "recipients": [
            {
                "mobiles": phone,
                "message": message
            }
        ]
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            logger.info(
                "Sending SMS via MSG91",
                extra={
                    "phone": phone,
                    "template_id": settings.MSG91_TEMPLATE_ID,
                    "sender": settings.MSG91_SENDER_ID,
                    "mock": False
                }
            )
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            
            response_data = response.json()
            if response_data.get("type") == "error":
                logger.error(
                    "MSG91 SMS API returned error response",
                    extra={
                        "phone": phone,
                        "status_code": response.status_code,
                        "response": response_data,
                        "mock": False
                    }
                )
                return False

            logger.info(
                "SMS sent successfully via MSG91",
                extra={
                    "phone": phone,
                    "response": response_data,
                    "mock": False
                }
            )
            return True

    except httpx.TimeoutException as e:
        logger.error(
            "Timeout error occurred while sending SMS via MSG91",
            extra={
                "phone": phone,
                "error": str(e),
                "mock": False
            },
            exc_info=True
        )
        return False
    except httpx.HTTPStatusError as e:
        logger.error(
            "HTTP error occurred while sending SMS via MSG91",
            extra={
                "phone": phone,
                "status_code": e.response.status_code,
                "response": e.response.text,
                "error": str(e),
                "mock": False
            },
            exc_info=True
        )
        return False
    except Exception as e:
        logger.error(
            "Unexpected error occurred while sending SMS via MSG91",
            extra={
                "phone": phone,
                "error": str(e),
                "mock": False
            },
            exc_info=True
        )
        return False
