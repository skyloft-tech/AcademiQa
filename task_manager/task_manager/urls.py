# task_manager/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from core.views import healthz  # <-- add this

urlpatterns = [
    path("healthz", healthz),          # <-- add this
    path("", include("core.urls")),    # core handles all /api/ routes (incl. token/refresh)
    path("admin/", admin.site.urls),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
