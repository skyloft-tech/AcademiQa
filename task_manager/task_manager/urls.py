from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from core.views import healthz
from django.http import JsonResponse

def healthz(_request): 
    return JsonResponse({"ok": True})

urlpatterns = [
    path("healthz", healthz),           # no trailing slash
    path("healthz/", healthz),          # with trailing slash (no redirect)
    path("", include("task_manager.core.urls")),
    path("admin/", admin.site.urls),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
