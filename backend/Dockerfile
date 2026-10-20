FROM python:3.11-slim

# Don't write .pyc files; send logs straight to Cloud Run without buffering
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies first, so this layer is cached between code changes
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Then copy only what the server needs
COPY app ./app
COPY scripts ./scripts
COPY migrations ./migrations

# Don't run as root
RUN useradd --create-home appuser
USER appuser

# Cloud Run tells the app which port to use via $PORT (default 8080)
CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]