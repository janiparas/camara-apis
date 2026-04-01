import os

class Settings:

    APP_NAME = "auth-service"
    ENV = os.getenv("ENV", "dev")

    # Keycloak
    KEYCLOAK_URL = os.getenv("KEYCLOAK_URL")
    KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM")
    CLIENT_ID = os.getenv("CLIENT_ID")
    CLIENT_SECRET = os.getenv("CLIENT_SECRET")

    # Redis
    REDIS_HOST = os.getenv("REDIS_HOST", "redis")
    REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
    REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")

    # Auth Flow
    REDIRECT_URI = os.getenv("REDIRECT_URI")
    SESSION_TTL = int(os.getenv("SESSION_TTL", 300))

    # HTTP
    TIMEOUT = int(os.getenv("HTTP_TIMEOUT", 5))
    #LOG_LEVEL
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

settings = Settings()