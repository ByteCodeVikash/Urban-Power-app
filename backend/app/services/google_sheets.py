import logging
from typing import Any, Dict, Optional
from google.oauth2 import service_account
from app.core.config import settings

logger = logging.getLogger(__name__)

class GoogleSheetsService:
    def __init__(self) -> None:
        self.credentials_info = settings.GOOGLE_SHEETS_CREDENTIALS
        self.spreadsheet_id = settings.GOOGLE_SHEETS_SPREADSHEET_ID
        self._creds = None

    @property
    def is_configured(self) -> bool:
        """
        Check if Google Sheets integration is configured.
        """
        return self.credentials_info is not None and self.spreadsheet_id is not None

    def get_credentials(self) -> Optional[service_account.Credentials]:
        """
        Loads and returns the Service Account credentials.
        """
        if not self.credentials_info:
            logger.warning("Google Sheets credentials are not configured.")
            return None

        if self._creds is None:
            try:
                scopes = ["https://www.googleapis.com/auth/spreadsheets"]
                self._creds = service_account.Credentials.from_service_account_info(
                    self.credentials_info, scopes=scopes
                )
            except Exception as e:
                logger.error(f"Failed to load Google Service Account credentials: {e}")
                raise e
        return self._creds

    def get_sheets_client(self) -> Any:
        """
        Returns an authorized Google Sheets API service client.
        Note: Requires google-api-python-client package.
        """
        creds = self.get_credentials()
        if not creds:
            raise ValueError("Google Sheets credentials are not configured or failed to load.")

        try:
            from googleapiclient.discovery import build
            return build("sheets", "v4", credentials=creds)
        except ImportError:
            logger.error("google-api-python-client is not installed. Please run 'pip install google-api-python-client'")
            raise ImportError(
                "google-api-python-client is required to build the Sheets API client. "
                "Ensure it is installed in your virtual environment."
            )
        except Exception as e:
            logger.error(f"Failed to build Google Sheets API client: {e}")
            raise e

def get_google_sheets_service() -> GoogleSheetsService:
    """
    Dependency provider that returns the GoogleSheetsService instance.
    """
    return GoogleSheetsService()
