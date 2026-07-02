import os
import logging
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status, Request
from app.core.config import settings
from app.models.user import User
from app.schemas.media import MediaResponse
from app.api.deps import get_current_active_user
from app.services.storage import BaseStorageService, get_storage_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/media", tags=["media"])

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/heic",
    "image/heif",
    "image/svg+xml",
}

ALLOWED_DOC_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  # .docx
    "application/vnd.ms-excel",  # .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",  # .xlsx
    "text/plain",
    "text/csv",
    "application/rtf",
}

ALLOWED_MIME_TYPES = ALLOWED_IMAGE_TYPES.union(ALLOWED_DOC_TYPES)

ALLOWED_EXTENSIONS = {
    # Images
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".heic", ".heif", ".svg",
    # Documents
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".csv", ".rtf"
}

@router.post("/upload", response_model=MediaResponse, status_code=status.HTTP_201_CREATED)
async def upload_media(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    storage_service: BaseStorageService = Depends(get_storage_service)
):
    """
    Upload a media file (Image or Document) to storage.
    
    Validates MIME type, file extension, and file size before uploading.
    Returns the uploaded file details.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must have a filename"
        )
    
    # 1. Validate Extension
    _, ext = os.path.splitext(file.filename)
    ext = ext.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension: {ext}. Supported extensions are: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )
        
    # 2. Validate MIME Type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file MIME type: {file.content_type}"
        )
        
    # 3. Validate File Size
    if file.size is not None:
        size = file.size
    else:
        try:
            file.file.seek(0, 2)
            size = file.file.tell()
            file.file.seek(0)
        except Exception as e:
            logger.error(f"Error determining file size: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not read file size"
            )

        
    max_size_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if size > max_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds the maximum limit of {settings.MAX_UPLOAD_SIZE_MB}MB"
        )
        
    # 4. Upload File
    try:
        # Pass the request base URL so local storage service can build fully qualified URLs
        file_url = await storage_service.upload_file(file, base_url=str(request.base_url))
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload file to storage"
        )
        
    return MediaResponse(
        file_url=file_url,
        file_name=file.filename,
        content_type=file.content_type,
        size=size
    )
