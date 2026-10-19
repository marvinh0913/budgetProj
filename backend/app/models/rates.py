"""Response model for interest rates."""

from datetime import date

from pydantic import BaseModel


class Rate(BaseModel):
    series_id: str
    value: float
    observation_date: date
