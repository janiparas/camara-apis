import uuid
from app.redis_client import redis_client
from app.config import settings

def create_session(msisdn: str) -> str:
    session_id = str(uuid.uuid4())
    redis_client.setex(session_id, settings.SESSION_TTL, msisdn)
    return session_id


def get_msisdn(session_id: str):
    return redis_client.get(session_id)


def delete_session(session_id: str):
    redis_client.delete(session_id)