import requests
from app.config import settings

def get_authorize_url(state: str) -> str:
    return (
        f"{settings.KEYCLOAK_URL}/realms/{settings.KEYCLOAK_REALM}/protocol/openid-connect/auth"
        f"?client_id={settings.CLIENT_ID}"
        f"&response_type=code"
        f"&redirect_uri={settings.REDIRECT_URI}"
        f"&scope=openid"
        f"&state={state}"
    )


def exchange_code_for_token(code: str):
    url = f"{settings.KEYCLOAK_URL}/realms/{settings.KEYCLOAK_REALM}/protocol/openid-connect/token"

    payload = {
        "grant_type": "authorization_code",
        "client_id": settings.CLIENT_ID,
        "client_secret": settings.CLIENT_SECRET,
        "code": code,
        "redirect_uri": settings.REDIRECT_URI
    }

    response = requests.post(url, data=payload, timeout=settings.TIMEOUT)

    if response.status_code != 200:
        raise Exception(f"Keycloak error: {response.text}")

    return response.json()