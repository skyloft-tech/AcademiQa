# Dockerfile (repo root)
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev curl && \
    rm -rf /var/lib/apt/lists/*

# Work in /app
WORKDIR /app

# Install backend dependencies from root requirements.txt
COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy ONLY the backend code (keeps images small)
COPY task_manager/ /app/task_manager/

# If you serve Django admin/static via WhiteNoise
WORKDIR /app/task_manager
RUN python task_manager/manage.py collectstatic --noinput || true

# Railway provides $PORT. asgi.py is inside task_manager/, so module is "asgi"
CMD daphne -b 0.0.0.0 -p $PORT task_manager.asgi:application
