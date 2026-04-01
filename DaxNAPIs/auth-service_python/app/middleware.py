import time
import uuid
from fastapi import Request
from app.utils.logger import logger

async def log_middleware(request: Request, call_next):

    trace_id = str(uuid.uuid4())
    start = time.time()

    response = await call_next(request)

    duration = round((time.time() - start) * 1000, 2)

    logger.info(
        f"{request.method} {request.url.path} status={response.status_code} duration_ms={duration}",
        extra={"trace_id": trace_id}
    )

    return response