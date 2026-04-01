import logging
import json
import sys
from app.config import settings

LOG_LEVEL = getattr(logging, settings.LOG_LEVEL, logging.INFO)


class JsonFormatter(logging.Formatter):
    def format(self, record):

        log_record = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "service": "auth-service",
            "message": record.getMessage(),
        }

        # Add optional fields if present
        if hasattr(record, "trace_id"):
            log_record["trace_id"] = record.trace_id

        if hasattr(record, "msisdn"):
            log_record["msisdn"] = record.msisdn

        return json.dumps(log_record)


logger = logging.getLogger("auth-service")
logger.setLevel(LOG_LEVEL)

handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(JsonFormatter())

logger.addHandler(handler)
logger.propagate = False