CREATE TABLE users (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email         TEXT        NOT NULL,
    password_hash TEXT        NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One account per email, ignoring case
CREATE UNIQUE INDEX users_email_lower_idx ON users (lower(email));

CREATE TABLE financial_profiles (
    user_id               BIGINT        PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    gross_monthly_income  NUMERIC(12,2) NOT NULL CHECK (gross_monthly_income >= 0),
    monthly_debt_payments NUMERIC(12,2) NOT NULL CHECK (monthly_debt_payments >= 0),
    down_payment_savings  NUMERIC(12,2) NOT NULL CHECK (down_payment_savings >= 0),
    updated_at            TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE transactions (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id          BIGINT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_type TEXT          NOT NULL CHECK (transaction_type IN ('income', 'expense')),
    category         TEXT          NOT NULL,
    amount           NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    transaction_date DATE          NOT NULL DEFAULT CURRENT_DATE,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX transactions_user_id_idx ON transactions (user_id);

CREATE TABLE rates (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    series_id        TEXT          NOT NULL,   -- e.g. 'MORTGAGE30US'
    rates_value      NUMERIC(6,3)  NOT NULL,   -- e.g. 6.590
    observation_date DATE          NOT NULL,   -- the date FRED reports for the value
    fetched_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
    UNIQUE (series_id, observation_date)
);
