"""
URL patterns for the orders app.
"""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CartViewSet, CouponValidateView, OrderViewSet

app_name = 'orders'

router = DefaultRouter()
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
    path('coupons/validate/', CouponValidateView.as_view(), name='coupon-validate'),
]
