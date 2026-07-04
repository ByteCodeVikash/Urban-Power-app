import httpx
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class HTTPClientManager:
    """
    Manages the lifecycle of a shared httpx.AsyncClient instance
    to enable connection pooling and connection reuse across requests.
    """
    def __init__(self):
        self.client: Optional[httpx.AsyncClient] = None

    def init_client(self):
        """
        Initialize the shared AsyncClient.
        """
        if self.client is None:
            logger.info("Initializing shared httpx.AsyncClient connection pool.")
            limits = httpx.Limits(max_keepalive_connections=20, max_connections=100)
            self.client = httpx.AsyncClient(limits=limits, timeout=10.0)

    async def close(self):
        """
        Gracefully close the shared AsyncClient on shutdown.
        """
        if self.client is not None:
            logger.info("Closing shared httpx.AsyncClient.")
            try:
                await self.client.aclose()
            except TypeError:
                # Handle cases in testing where httpx.AsyncClient is patched/mocked
                pass
            except Exception as e:
                logger.warning(f"Error closing HTTP client: {e}")
            self.client = None

http_manager = HTTPClientManager()

async def get_http_client() -> httpx.AsyncClient:
    """
    Retrieve the active shared httpx.AsyncClient instance.
    """
    if http_manager.client is None:
        http_manager.init_client()
    return http_manager.client
