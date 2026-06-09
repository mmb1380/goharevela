"""
URL patterns for the products app.
"""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, ProductReviewViewSet, ProductViewSet, StoneTypeViewSet

app_name = 'products'

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'stones', StoneTypeViewSet, basename='stonetype')
router.register(r'reviews', ProductReviewViewSet, basename='review')
router.register(r'', ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
]
