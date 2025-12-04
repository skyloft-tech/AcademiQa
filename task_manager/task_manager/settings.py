# file: task_manager/settings.py
import os
from pathlib import Path
from datetime import timedelta

from dotenv import load_dotenv
import dj_database_url

load_dotenv()

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────
def get_bool(name: str, default: bool = False) -> bool:
    val = os.getenv(name)
    if val is None:
        return default
    return val.strip().lower() in {"1", "true", "yes", "on"}

def get_csv(name: str, default=None):
    raw = os.getenv(name)
    if not raw:
        return default or []
    return [x.strip() for x in raw.split(",") if x.strip()]

# ─────────────────────────────────────────────────────────────────────────────
# Paths
# ─────────────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent

# ─────────────────────────────────────────────────────────────────────────────
# Core flags
# ─────────────────────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
DEBUG = get_bool("DEBUG", False)

# Hosts
_default_hosts = [
    "localhost", "127.0.0.1", "[::1]",
    # add your Railway public host here or via env ALLOWED_HOSTS
    ".railway.app",
]
ALLOWED_HOSTS = list(set(get_csv("ALLOWED_HOSTS", _default_hosts)))

# Optional front/back origins (full scheme+host)
FRONTEND_ORIGINS = get_csv("FRONTEND_ORIGINS", [])
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN")  # single value compatibility
if FRONTEND_ORIGIN and FRONTEND_ORIGIN not in FRONTEND_ORIGINS:
    FRONTEND_ORIGINS.append(FRONTEND_ORIGIN)

BACKEND_ORIGIN = os.getenv("BACKEND_ORIGIN")  # e.g., https://yourservice.up.railway.app

# ─────────────────────────────────────────────────────────────────────────────
# Installed apps
# ─────────────────────────────────────────────────────────────────────────────
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

# ─────────────────────────────────────────────────────────────────────────────
# Middleware (order matters)
# ─────────────────────────────────────────────────────────────────────────────
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",          # must be first
    "whitenoise.middleware.WhiteNoiseMiddleware",             # serve static in prod
    "corsheaders.middleware.CorsMiddleware",                  # before CommonMiddleware
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "task_manager.urls"

# ASGI/WSGI
ASGI_APPLICATION = "task_manager.asgi.application"
WSGI_APPLICATION = "task_manager.wsgi.application"

# ─────────────────────────────────────────────────────────────────────────────
# Templates
# ─────────────────────────────────────────────────────────────────────────────
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

# ─────────────────────────────────────────────────────────────────────────────
# Database (Railway Postgres via DATABASE_URL)
# ─────────────────────────────────────────────────────────────────────────────
DATABASES = {
    "default": dj_database_url.config(
        default=os.getenv("DATABASE_URL"),
        conn_max_age=600,
        ssl_require=not DEBUG,
    )
}

# ─────────────────────────────────────────────────────────────────────────────
# Channels (Redis) – only if REDIS_URL present
# ─────────────────────────────────────────────────────────────────────────────
REDIS_URL = os.getenv("REDIS_URL")
if REDIS_URL:
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {"hosts": [REDIS_URL]},
        }
    }

# ─────────────────────────────────────────────────────────────────────────────
# Celery (broker=result via Redis; results in DB)
# ─────────────────────────────────────────────────────────────────────────────
CELERY_BROKER_URL = REDIS_URL or os.getenv("CELERY_BROKER_URL", "redis://127.0.0.1:6379/0")
CELERY_RESULT_BACKEND = "django-db"
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = "Africa/Nairobi"

# ─────────────────────────────────────────────────────────────────────────────
# REST Framework + JWT
# ─────────────────────────────────────────────────────────────────────────────
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

# ─────────────────────────────────────────────────────────────────────────────
# CORS / CSRF
# ─────────────────────────────────────────────────────────────────────────────
# Prefer explicit origins in production
CORS_ALLOW_ALL_ORIGINS = get_bool("CORS_ALLOW_ALL_ORIGINS", False)

# If not allow-all, use explicit and/or regex (e.g., Netlify subdomains)
if not CORS_ALLOW_ALL_ORIGINS:
    CORS_ALLOWED_ORIGINS = FRONTEND_ORIGINS
    # Add common host patterns via regex if needed
    CORS_ALLOWED_ORIGIN_REGEXES = get_csv("CORS_ALLOWED_ORIGIN_REGEXES", [r"^https:\/\/.*\.netlify\.app$"])

# CSRF: build from frontend + backend origins; can override via env CSV
CSRF_TRUSTED_ORIGINS = get_csv("CSRF_TRUSTED_ORIGINS", [])
for origin in FRONTEND_ORIGINS:
    if origin not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append(origin)
if BACKEND_ORIGIN and BACKEND_ORIGIN not in CSRF_TRUSTED_ORIGINS:
    CSRF_TRUSTED_ORIGINS.append(BACKEND_ORIGIN)

SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG

# ─────────────────────────────────────────────────────────────────────────────
# Static & Media
# ─────────────────────────────────────────────────────────────────────────────
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# Only include extra static dirs if they exist (prevents W004)
_possible_static_dirs = [BASE_DIR / "static"]
STATICFILES_DIRS = [p for p in _possible_static_dirs if p.exists()]

# Modern storage setting (Django ≥4.2)
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    }
}

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ─────────────────────────────────────────────────────────────────────────────
# Email (env-driven)
# ─────────────────────────────────────────────────────────────────────────────
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USE_TLS = get_bool("EMAIL_USE_TLS", True)
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# ─────────────────────────────────────────────────────────────────────────────
# i18n / tz
# ─────────────────────────────────────────────────────────────────────────────
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Nairobi"
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ─────────────────────────────────────────────────────────────────────────────
# Security behind proxy (Railway)
# ─────────────────────────────────────────────────────────────────────────────
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = False  # Railway terminates TLS
    SECURE_HSTS_SECONDS = int(os.getenv("SECURE_HSTS_SECONDS", "31536000"))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
