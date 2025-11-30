from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def healthz(_request):
    return JsonResponse({"ok": True})

urlpatterns = [
    path("healthz", healthz),          # health check
    path("", include("core.urls")),    # core handles /api/... routes
    path("admin/", admin.site.urls),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
