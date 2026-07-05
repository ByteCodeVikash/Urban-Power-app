import logging

logger = logging.getLogger(__name__)

async def send_sms(phone: str, message: str) -> bool:
    """
    Simulate sending an SMS message (MSG91 SMS provider has been removed).
    
    Args:
        phone: Recipient phone number (with country code, e.g. "919999999999")
        message: Message content to send
        
    Returns:
        bool: True representing simulated success.
    """
    logger.info(
        "SMS send simulated (MSG91 removed)",
        extra={
            "phone": phone,
            "sms_message": message,
            "status": "success",
            "mock": True
        }
    )
    return True
