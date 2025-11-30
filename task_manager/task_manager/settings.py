# task_manager/settings.py  — Railway-ready
import os
from pathlib import Path
from datetime import timedelta

# ----- Base paths
BASE_DIR = Path(__file__).resolve().parent.parent

# ----- Core flags
SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
DEBUG = os.getenv("DEBUG", "False") == "True"

# On Railway you'll get a *.railway.app host; allow localhost for dev
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "*.railway.app,localhost,127.0.0.1,[::1]").split(",")

# ----- Installed apps
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "channels",
    "django_celery_results",

    "core.apps.CoreConfig",
]

# ----- Middleware (WhiteNoise for static files)
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # <— add
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "task_manager.urls"

# IMPORTANT: your asgi.py is at repo root (module name is 'asgi'), not task_manager.asgi
ASGI_APPLICATION = "task_manager.asgi.application"
WSGI_APPLICATION = "task_manager.wsgi.application"

# ----- Templates
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ----- Database (Railway Postgres via DATABASE_URL)
# Install dj-database-url in requirements.
import dj_database_url

DATABASES = {
    "default": dj_database_url.config(
        default=os.getenv("DATABASE_URL"),  # injected by Railway Postgres add-on
        conn_max_age=600,
        ssl_require=True,
    )
}

# ----- Channels (WebSockets) via Redis
# Railway Redis injects REDIS_URL, e.g. redis://:pass@host:port
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {"hosts": [REDIS_URL]},
    }
}

# ----- Celery (optional for MVP; safe to point at same Redis)
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", REDIS_URL)
CELERY_RESULT_BACKEND = "django-db"
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = "Africa/Nairobi"

# ----- REST Framework + JWT
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
}
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=7),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=30),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ----- CORS / CSRF
# For first deploy, keep permissive CORS. We will tighten to your frontend domain after it’s live.
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# If you prefer explicit origins now, comment the two lines above and set:
# CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "").split(",") if os.getenv("CORS_ALLOWED_ORIGINS") else []

# CSRF: trust Railway and your custom domain (add later)
CSRF_TRUSTED_ORIGINS = [
    "https://*.railway.app",
    # add e.g. "https://academiqa.org", "https://www.academiqa.org" later
]

# ----- Static & Media
STATIC_URL = "/static/"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATIC_ROOT = BASE_DIR / "staticfiles"
# WhiteNoise robust caching for production
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ----- Email (unchanged; env-driven secrets)
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# ----- Other settings
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Nairobi"
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ----- Security behind Railway proxy (HTTPS headers)
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
