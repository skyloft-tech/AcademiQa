# file: task_manager/urls.py
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse, HttpResponseRedirect
from django.conf import settings
from django.conf.urls.static import static

def healthz(_request):
    return JsonResponse({"ok": True})

def favicon(_request):
    # Why: avoid 502s on /favicon.ico; let WhiteNoise serve the static file
    return HttpResponseRedirect("/static/favicon.ico")

urlpatterns = [
    # Health (both variants)
    path("healthz", healthz),
    path("healthz/", healthz),

    # Favicon (served via WhiteNoise after collectstatic)
    path("favicon.ico", favicon),

    # App routes
    path("", include("core.urls")),
    path("admin/", admin.site.urls),
]

# Only serve MEDIA from Django in DEBUG
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
