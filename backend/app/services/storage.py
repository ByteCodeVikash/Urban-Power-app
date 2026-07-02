import os
import re
import uuid
import logging
from abc import ABC, abstractmethod
from io import BytesIO
from fastapi import UploadFile
import anyio
import boto3
from botocore.config import Config
from app.core.config import settings

logger = logging.getLogger(__name__)

def sanitize_filename(filename: str) -> str:
    """
    Sanitizes file name to prevent directory traversal and handle unsafe URL characters.
    """
    base = os.path.basename(filename)
    name, ext = os.path.splitext(base)
    # Allow alphanumeric, underscore, hyphen
    name = re.sub(r"[^a-zA-Z0-9_\-]", "_", name)
    # Allow alphanumeric extension
    ext = re.sub(r"[^a-zA-Z0-9]", "", ext)
    if ext:
        return f"{name}.{ext.lower()}"
    return name

class BaseStorageService(ABC):
    @abstractmethod
    async def upload_file(self, file: UploadFile, base_url: str = "") -> str:
        """
        Uploads a file and returns the public URL.
        """
        pass

class LocalStorageService(BaseStorageService):
    def __init__(self, upload_dir: str = "media"):
        self.upload_dir = upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)

    async def upload_file(self, file: UploadFile, base_url: str = "") -> str:
        # Read the file content
        content = await file.read()
        unique_id = uuid.uuid4()
        sanitized = sanitize_filename(file.filename)
        
        # Target folder path: media/{unique_id}
        target_dir = os.path.join(self.upload_dir, str(unique_id))
        target_path = os.path.join(target_dir, sanitized)
        
        def write_file_sync():
            os.makedirs(target_dir, exist_ok=True)
            with open(target_path, "wb") as f:
                f.write(content)
                
        # Run synchronous write in a thread pool to avoid blocking the event loop
        await anyio.to_thread.run_sync(write_file_sync)
        
        # Build public URL
        # base_url is the backend's root URL (e.g. http://localhost:8000)
        base = base_url.rstrip("/") if base_url else ""
        return f"{base}/media/{unique_id}/{sanitized}"

class S3StorageService(BaseStorageService):
    def __init__(self):
        self.bucket = settings.S3_BUCKET_NAME
        self.custom_domain = settings.S3_PUBLIC_URL_PREFIX
        self.endpoint_url = settings.S3_ENDPOINT_URL
        self.region = settings.S3_REGION
        
        config = Config(
            retries={"max_attempts": 3},
            signature_version="s3v4"
        )
        
        s3_kwargs = {
            "aws_access_key_id": settings.S3_ACCESS_KEY_ID,
            "aws_secret_access_key": settings.S3_SECRET_ACCESS_KEY,
            "config": config,
        }
        
        if self.endpoint_url:
            s3_kwargs["endpoint_url"] = self.endpoint_url
        if self.region:
            s3_kwargs["region_name"] = self.region
            
        self.s3_client = boto3.client("s3", **s3_kwargs)

    async def upload_file(self, file: UploadFile, base_url: str = "") -> str:
        content = await file.read()
        unique_id = uuid.uuid4()
        sanitized = sanitize_filename(file.filename)
        key = f"media/{unique_id}/{sanitized}"
        
        file_obj = BytesIO(content)
        
        # Run blocking boto3 client upload in a thread pool
        try:
            await anyio.to_thread.run_sync(
                self.s3_client.upload_fileobj,
                file_obj,
                self.bucket,
                key,
                {
                    "ContentType": file.content_type
                }
            )
        except Exception as e:
            logger.error(f"Failed uploading file to S3/R2: {e}")
            raise e
            
        # Construct public URL
        if self.custom_domain:
            prefix = self.custom_domain.rstrip("/")
            return f"{prefix}/{key}"
        else:
            if self.endpoint_url:
                endpoint = self.endpoint_url.rstrip("/")
                return f"{endpoint}/{self.bucket}/{key}"
            else:
                region = self.region or "us-east-1"
                return f"https://{self.bucket}.s3.{region}.amazonaws.com/{key}"

def get_storage_service() -> BaseStorageService:
    """
    Dependency provider that returns the appropriate storage service instance.
    """
    if settings.STORAGE_PROVIDER == "s3":
        return S3StorageService()
    return LocalStorageService()
