import os
from typing import Any
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Urban Power Backend"
    API_V1_STR: str = "/api/v1"
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: list[str] | str = [
        "http://localhost:3000",
        "http://localhost:8081",
        "http://localhost:19006",
        "exp://*",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> list[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, str):
            import json
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return [str(i).strip() for i in parsed]
                return [str(parsed).strip()]
            except Exception:
                return [v.strip()]
        elif isinstance(v, list):
            return [str(i).strip() for i in v]
        return v
    
    # Database Settings
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "urbanpower")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        
    # Redis Settings
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    # MSG91 Settings
    MSG91_AUTH_KEY: str | None = None
    MSG91_TEMPLATE_ID: str | None = None
    MSG91_SENDER_ID: str | None = None
    SMS_MOCK: bool = True

    @model_validator(mode="after")
    def validate_msg91_settings(self) -> "Settings":
        # Check if any MSG91 setting is set
        msg91_values = [self.MSG91_AUTH_KEY, self.MSG91_TEMPLATE_ID, self.MSG91_SENDER_ID]
        configured_count = sum(1 for val in msg91_values if val and str(val).strip())
        
        if configured_count > 0:
            if configured_count < 3:
                missing = []
                if not (self.MSG91_AUTH_KEY and str(self.MSG91_AUTH_KEY).strip()):
                    missing.append("MSG91_AUTH_KEY")
                if not (self.MSG91_TEMPLATE_ID and str(self.MSG91_TEMPLATE_ID).strip()):
                    missing.append("MSG91_TEMPLATE_ID")
                if not (self.MSG91_SENDER_ID and str(self.MSG91_SENDER_ID).strip()):
                    missing.append("MSG91_SENDER_ID")
                raise ValueError(
                    f"Incomplete MSG91 configuration. Missing: {', '.join(missing)}"
                )
            
            # Format validation
            auth_key = str(self.MSG91_AUTH_KEY).strip()
            sender_id = str(self.MSG91_SENDER_ID).strip()
            template_id = str(self.MSG91_TEMPLATE_ID).strip()
            
            if len(auth_key) < 10:
                raise ValueError("MSG91_AUTH_KEY is invalid (too short)")
            
            if len(sender_id) != 6:
                raise ValueError("MSG91_SENDER_ID must be exactly 6 characters")
                
            if not template_id.isalnum():
                raise ValueError("MSG91_TEMPLATE_ID must be alphanumeric")
                
        return self
        
    # JWT Authentication Settings
    SECRET_KEY: str = "super-secret-urban-power-key-change-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Razorpay Settings
    RAZORPAY_KEY_ID: str | None = None
    RAZORPAY_KEY_SECRET: str | None = None
    
    # Firebase Settings
    FIREBASE_API_KEY: str | None = None
    
    # Google OAuth Settings
    GOOGLE_CLIENT_ID: str | None = None
    GOOGLE_CLIENT_SECRET: str | None = None
    GOOGLE_ANDROID_CLIENT_ID: str | None = None
    GOOGLE_IOS_CLIENT_ID: str | None = None

    # Google Sheets Settings
    GOOGLE_SHEETS_CREDENTIALS_FILE: str | None = None
    GOOGLE_SHEETS_CREDENTIALS_JSON: str | None = None
    GOOGLE_SHEETS_SPREADSHEET_ID: str | None = None
    GOOGLE_APPLICATION_CREDENTIALS: str | None = None
    GOOGLE_SHEET_ID: str | None = None

    @property
    def GOOGLE_SHEETS_CREDENTIALS(self) -> dict[str, Any] | None:
        import json
        
        # Check GOOGLE_APPLICATION_CREDENTIALS first
        if self.GOOGLE_APPLICATION_CREDENTIALS and self.GOOGLE_APPLICATION_CREDENTIALS.strip():
            cred_str = self.GOOGLE_APPLICATION_CREDENTIALS.strip()
            if cred_str.startswith("{"):
                try:
                    return json.loads(cred_str)
                except Exception as e:
                    raise ValueError(f"Invalid JSON string in GOOGLE_APPLICATION_CREDENTIALS: {e}")
            else:
                if os.path.exists(cred_str):
                    try:
                        with open(cred_str, "r") as f:
                            return json.load(f)
                    except Exception as e:
                        raise ValueError(f"Failed to read credentials file from GOOGLE_APPLICATION_CREDENTIALS ({cred_str}): {e}")
                else:
                    # Try relative to the backend workspace root
                    workspace_rel = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), cred_str)
                    if os.path.exists(workspace_rel):
                        try:
                            with open(workspace_rel, "r") as f:
                                return json.load(f)
                        except Exception as e:
                            raise ValueError(f"Failed to read credentials file from GOOGLE_APPLICATION_CREDENTIALS ({workspace_rel}): {e}")
        
        if self.GOOGLE_SHEETS_CREDENTIALS_JSON and self.GOOGLE_SHEETS_CREDENTIALS_JSON.strip():
            try:
                return json.loads(self.GOOGLE_SHEETS_CREDENTIALS_JSON)
            except Exception as e:
                raise ValueError(f"Invalid JSON string in GOOGLE_SHEETS_CREDENTIALS_JSON: {e}")
        
        if self.GOOGLE_SHEETS_CREDENTIALS_FILE and self.GOOGLE_SHEETS_CREDENTIALS_FILE.strip():
            file_path = self.GOOGLE_SHEETS_CREDENTIALS_FILE.strip()
            if os.path.exists(file_path):
                try:
                    with open(file_path, "r") as f:
                        return json.load(f)
                except Exception as e:
                    raise ValueError(f"Failed to read credentials file {file_path}: {e}")
            else:
                workspace_rel = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), file_path)
                if os.path.exists(workspace_rel):
                    try:
                        with open(workspace_rel, "r") as f:
                            return json.load(f)
                    except Exception as e:
                        raise ValueError(f"Failed to read credentials file {workspace_rel}: {e}")
        return None

    @model_validator(mode="after")
    def validate_google_sheets_settings(self) -> "Settings":
        if isinstance(self.GOOGLE_SHEETS_CREDENTIALS_FILE, str) and not self.GOOGLE_SHEETS_CREDENTIALS_FILE.strip():
            self.GOOGLE_SHEETS_CREDENTIALS_FILE = None
        if isinstance(self.GOOGLE_SHEETS_CREDENTIALS_JSON, str) and not self.GOOGLE_SHEETS_CREDENTIALS_JSON.strip():
            self.GOOGLE_SHEETS_CREDENTIALS_JSON = None
        if isinstance(self.GOOGLE_SHEETS_SPREADSHEET_ID, str) and not self.GOOGLE_SHEETS_SPREADSHEET_ID.strip():
            self.GOOGLE_SHEETS_SPREADSHEET_ID = None
        if isinstance(self.GOOGLE_APPLICATION_CREDENTIALS, str) and not self.GOOGLE_APPLICATION_CREDENTIALS.strip():
            self.GOOGLE_APPLICATION_CREDENTIALS = None
        if isinstance(self.GOOGLE_SHEET_ID, str) and not self.GOOGLE_SHEET_ID.strip():
            self.GOOGLE_SHEET_ID = None

        # Synchronize GOOGLE_SHEET_ID and GOOGLE_SHEETS_SPREADSHEET_ID
        if self.GOOGLE_SHEET_ID and not self.GOOGLE_SHEETS_SPREADSHEET_ID:
            self.GOOGLE_SHEETS_SPREADSHEET_ID = self.GOOGLE_SHEET_ID
        elif self.GOOGLE_SHEETS_SPREADSHEET_ID and not self.GOOGLE_SHEET_ID:
            self.GOOGLE_SHEET_ID = self.GOOGLE_SHEETS_SPREADSHEET_ID
            
        return self

    # Google Maps Settings
    GOOGLE_MAPS_API_KEY: str | None = None
    GOOGLE_MAPS_MOCK: bool = True

    # Storage Settings
    STORAGE_PROVIDER: str = "local"  # "local" or "s3"
    S3_BUCKET_NAME: str | None = None
    S3_ACCESS_KEY_ID: str | None = None
    S3_SECRET_ACCESS_KEY: str | None = None
    S3_ENDPOINT_URL: str | None = None
    S3_REGION: str | None = None
    S3_PUBLIC_URL_PREFIX: str | None = None
    MAX_UPLOAD_SIZE_MB: int = 10

    @model_validator(mode="after")
    def validate_storage_settings(self) -> "Settings":
        if self.STORAGE_PROVIDER == "s3":
            missing = []
            if not self.S3_BUCKET_NAME:
                missing.append("S3_BUCKET_NAME")
            if not self.S3_ACCESS_KEY_ID:
                missing.append("S3_ACCESS_KEY_ID")
            if not self.S3_SECRET_ACCESS_KEY:
                missing.append("S3_SECRET_ACCESS_KEY")
            if missing:
                raise ValueError(
                    f"Incomplete S3/R2 storage configuration. Missing: {', '.join(missing)}"
                )
        return self
        
    model_config = SettingsConfigDict(

        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()

