"""Transaction endpoints for the logged-in user."""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.db import get_db
from app.dependencies import get_current_user_id
from app.models.transactions import TransactionCreate, TransactionResponse

router = APIRouter(prefix="/transactions", tags=["transactions"])

COLUMNS = "id, transaction_type, category, amount, transaction_date, created_at"


@router.get("", response_model=list[TransactionResponse])
def list_transactions(
    start_date: date | None = None,
    end_date: date | None = None,
    user_id: int = Depends(get_current_user_id),
    conn=Depends(get_db),
):
    return conn.execute(
        f"""
        SELECT {COLUMNS} FROM transactions
        WHERE user_id = %s
          AND (%s::date IS NULL OR transaction_date >= %s::date)
          AND (%s::date IS NULL OR transaction_date <= %s::date)
        ORDER BY transaction_date DESC, id DESC
        """,
        (user_id, start_date, start_date, end_date, end_date),
    ).fetchall()


@router.post(
    "",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_transaction(
    body: TransactionCreate,
    user_id: int = Depends(get_current_user_id),
    conn=Depends(get_db),
):
    return conn.execute(
        f"""
        INSERT INTO transactions
            (user_id, transaction_type, category, amount, transaction_date)
        VALUES (%s, %s, %s, %s, COALESCE(%s, CURRENT_DATE))
        RETURNING {COLUMNS}
        """,
        (
            user_id,
            body.transaction_type,
            body.category.strip(),
            body.amount,
            body.transaction_date,
        ),
    ).fetchone()


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    user_id: int = Depends(get_current_user_id),
    conn=Depends(get_db),
):
    deleted = conn.execute(
        "DELETE FROM transactions WHERE id = %s AND user_id = %s RETURNING id",
        (transaction_id, user_id),
    ).fetchone()
    if deleted is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
