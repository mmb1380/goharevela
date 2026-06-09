"""
Main URL configuration for حجره شوشتری backend.
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from wagtail import urls as wagtail_urls
from wagtail.admin import urls as wagtailadmin_urls
from wagtail.api.v2.router import WagtailAPIRouter
from wagtail.api.v2.views import PagesAPIViewSet
from wagtail.documents.api.v2.views import DocumentsAPIViewSet
from wagtail.images.api.v2.views import ImagesAPIViewSet

# ---------------------------------------------------------------------------
# Wagtail API router
# ---------------------------------------------------------------------------
wagtail_api_router = WagtailAPIRouter('wagtailapi')
wagtail_api_router.register_endpoint('pages', PagesAPIViewSet)
wagtail_api_router.register_endpoint('images', ImagesAPIViewSet)
wagtail_api_router.register_endpoint('documents', DocumentsAPIViewSet)

# ---------------------------------------------------------------------------
# URL patterns
# ---------------------------------------------------------------------------
urlpatterns = [
    # Django admin
    path('django-admin/', admin.site.urls),

    # Wagtail admin
    path('cms/', include(wagtailadmin_urls)),

    # Wagtail API
    path('api/cms/', wagtail_api_router.urls),

    # JWT auth endpoints
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # Application API endpoints
    path('api/accounts/', include('apps.accounts.urls', namespace='accounts')),
    path('api/products/', include('apps.products.urls', namespace='products')),
    path('api/orders/', include('apps.orders.urls', namespace='orders')),

    # Wagtail front-end (catch-all – must be last)
    path('', include(wagtail_urls)),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
