"""Public interest rate endpoint."""

from fastapi import APIRouter, Depends, Response

from app.db import get_db
from app.models.rates import Rate
from app.services.rates import get_latest_rates

router = APIRouter(prefix="/rates", tags=["rates"])


@router.get("", response_model=dict[str, Rate])
def list_rates(response: Response, conn=Depends(get_db)):
    # Rates change at most daily, so browsers can reuse a response for an hour
    response.headers["Cache-Control"] = "public, max-age=3600"
    return get_latest_rates(conn)
