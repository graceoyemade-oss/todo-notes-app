import os
import requests
from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")


@router.post("/api/auth/google")
async def google_auth(body: dict):
    """Verify Google OAuth credential and return user info."""
    credential = body.get("credential")
    if not credential:
        raise HTTPException(status_code=400, detail="Missing credential")

    # Verify the token with Google
    response = requests.get(
        "https://oauth2.googleapis.com/tokeninfo",
        params={"id_token": credential},
        timeout=10,
    )

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    token_info = response.json()

    # Verify the token was issued to our app
    if token_info.get("aud") != GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=401, detail="Token not issued for this app")

    user = {
        "google_id": token_info["sub"],
        "name": token_info.get("name", ""),
        "email": token_info.get("email", ""),
        "picture": token_info.get("picture", ""),
    }

    return {"user": user}
