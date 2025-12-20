import requests
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.settings import settings

security = HTTPBearer()
_jwks_cache = None 

def _get_jwks():
    """
    JWKS = JSON Web Key Set (public keys).
    Clerk rotates keys; we fetch from their endpoint.
    Cache it so we don't hit Clerk on every request.
    """
    global _jwks_cache
    if _jwks_cache is None:
        _jwks_cache = requests.get(settings.CLERK_JWKS_URL, timeout=10).json()
    return _jwks_cache

def get_current_user_id(
        creds: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    This is the auth dependency.

    - Reads Authorization: Bearer <token>
    - Verifies token signature using Clerk public keys
    - Returns the authenticated user's id (payload["sub"])
    """
    token = creds.credentials
    jwks = _get_jwks()

    try:
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")

        key = next((k for k in jwks["keys"] if k.get("kid")==kid),None)
        if not key:
             raise HTTPException(status_code=401, detail="Invalid token key id.")
        
        verify_aud = bool(getattr(settings, "CLERK_AUDIENCE",None))
        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            issuer=settings.CLERK_ISSUER,
            audience=getattr(settings, "CLERK_AUDIENCE", None),
            options={"verify_aud": verify_aud},
        )


        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token missing subject.")

        return user_id

    except JWTError:
        # JWTErrors invalid signature, expired token, wrong issuer, etc.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )


    