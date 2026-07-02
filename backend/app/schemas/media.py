from pydantic import BaseModel, Field

class MediaResponse(BaseModel):
    """
    Schema representing the metadata of an uploaded file.
    """
    file_url: str = Field(..., description="The public URL where the file is accessible")
    file_name: str = Field(..., description="The original name of the uploaded file")
    content_type: str = Field(..., description="The MIME type of the file")
    size: int = Field(..., description="The size of the file in bytes")
