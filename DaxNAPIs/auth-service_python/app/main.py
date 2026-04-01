from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse

from prometheus_fastapi_instrumentator import Instrumentator

from app.middleware import log_middleware
from app.services.auth_service import create_session, get_msisdn, delete_session
from app.services.keycloak_service import get_authorize_url, exchange_code_for_token
from app.logger import logger

app = FastAPI(title="Auth Service", version="1.0.0")

# Middleware
app.middleware("http")(log_middleware)

# Metrics
Instrumentator().instrument(app).expose(app, endpoint="/metrics")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/auth")
async def auth(request: Request):

    msisdn = request.headers.get("x-msisdn")

    if not msisdn:
        logger.warning("Missing MSISDN header")
        raise HTTPException(status_code=400, detail="MSISDN missing")

    session_id = create_session(msisdn)

    redirect_url = get_authorize_url(session_id)

    logger.info(f"Session created session_id={session_id}")

    return RedirectResponse(redirect_url)


@app.get("/callback")
async def callback(code: str, state: str):

    msisdn = get_msisdn(state)

    if not msisdn:
        logger.error("Session expired")
        raise HTTPException(status_code=400, detail="Session expired")

    try:
        token_data = exchange_code_for_token(code)
    except Exception as e:
        logger.error(f"Token exchange failed error={str(e)}")
        raise HTTPException(status_code=500, detail="Token exchange failed")

    delete_session(state)

    token_data["msisdn"] = msisdn

    return JSONResponse(token_data)