"""
Views for the orders app.
"""
from decimal import Decimal

from django.conf import settings as django_settings
from django.shortcuts import get_object_or_404, redirect
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.products.models import Product

from .models import Cart, CartItem, Order
from .payment import get_payment_adapter
from .serializers import (
    CartItemSerializer,
    CartSerializer,
    CouponValidateSerializer,
    OrderCreateSerializer,
    OrderSerializer,
    ShippingMethodSerializer,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_or_create_cart(request) -> Cart:
    """
    Return the cart for the authenticated user, or the session-based cart
    for anonymous visitors.  Merge session cart into user cart on login.
    """
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user, session_key='')
        # Merge any anonymous session cart
        session_key = request.session.session_key or ''
        if session_key:
            anon_cart = Cart.objects.filter(session_key=session_key, user__isnull=True).first()
            if anon_cart:
                for item in anon_cart.items.select_related('product').all():
                    existing = cart.items.filter(product=item.product).first()
                    if existing:
                        existing.quantity += item.quantity
                        existing.save()
                    else:
                        item.cart = cart
                        item.pk = None
                        item.save()
                anon_cart.delete()
        return cart
    else:
        if not request.session.session_key:
            request.session.create()
        session_key = request.session.session_key
        cart, _ = Cart.objects.get_or_create(session_key=session_key, user__isnull=True)
        return cart


# ---------------------------------------------------------------------------
# Cart
# ---------------------------------------------------------------------------

class CartViewSet(viewsets.ViewSet):
    """
    GET    /api/orders/cart/                 – get current cart
    POST   /api/orders/cart/add/             – add item to cart
    PUT    /api/orders/cart/update/<id>/     – update item quantity
    DELETE /api/orders/cart/remove/<id>/     – remove item
    DELETE /api/orders/cart/clear/           – clear entire cart
    """
    permission_classes = [permissions.AllowAny]

    def list(self, request):
        """GET /api/orders/cart/ – retrieve cart with items."""
        cart = _get_or_create_cart(request)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add(self, request):
        """POST /api/orders/cart/add/ – add or increment product."""
        cart = _get_or_create_cart(request)
        serializer = CartItemSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        product = serializer.validated_data['product']
        quantity = serializer.validated_data.get('quantity', 1)

        item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            item.quantity += quantity
        else:
            item.quantity = quantity

        if item.quantity > product.stock:
            return Response(
                {'detail': f'موجودی کافی نیست. حداکثر: {product.stock} عدد.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        item.save()

        cart_serializer = CartSerializer(cart, context={'request': request})
        return Response(cart_serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['put', 'patch'], url_path='update')
    def update_item(self, request, pk=None):
        """PUT /api/orders/cart/update/<id>/ – set quantity for a cart item."""
        cart = _get_or_create_cart(request)
        item = get_object_or_404(CartItem, pk=pk, cart=cart)
        quantity = request.data.get('quantity')
        if quantity is None or int(quantity) < 1:
            return Response({'detail': 'تعداد باید حداقل ۱ باشد.'}, status=status.HTTP_400_BAD_REQUEST)
        quantity = int(quantity)
        if quantity > item.product.stock:
            return Response(
                {'detail': f'موجودی کافی نیست. حداکثر: {item.product.stock} عدد.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        item.quantity = quantity
        item.save()
        cart_serializer = CartSerializer(cart, context={'request': request})
        return Response(cart_serializer.data)

    @action(detail=True, methods=['delete'], url_path='remove')
    def remove_item(self, request, pk=None):
        """DELETE /api/orders/cart/remove/<id>/ – remove a single item."""
        cart = _get_or_create_cart(request)
        item = get_object_or_404(CartItem, pk=pk, cart=cart)
        item.delete()
        cart_serializer = CartSerializer(cart, context={'request': request})
        return Response(cart_serializer.data)

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        """DELETE /api/orders/cart/clear/ – remove all items."""
        cart = _get_or_create_cart(request)
        cart.items.all().delete()
        cart_serializer = CartSerializer(cart, context={'request': request})
        return Response(cart_serializer.data)


# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------

class OrderViewSet(viewsets.GenericViewSet):
    """
    GET  /api/orders/orders/      – list authenticated user's orders
    GET  /api/orders/orders/<id>/ – retrieve single order
    POST /api/orders/orders/      – create order from current cart
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects
            .filter(user=self.request.user)
            .prefetch_related('items__product')
            .order_by('-created_at')
        )

    def list(self, request):
        queryset = self.get_queryset()
        serializer = OrderSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        order = get_object_or_404(Order, pk=pk, user=request.user)
        serializer = OrderSerializer(order, context={'request': request})
        return Response(serializer.data)

    def create(self, request):
        cart = _get_or_create_cart(request)
        if cart.item_count == 0:
            return Response(
                {'detail': 'سبد خرید خالی است.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = OrderCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        try:
            order = serializer.create_order(cart)
        except Exception as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        # Send SMS confirmation now only for non-online methods; for online
        # payments the confirmation is sent after a successful gateway callback.
        if order.payment_method != 'online':
            try:
                from .sms import get_sms_adapter
                sms = get_sms_adapter()
                sms.send_order_confirmation(order.phone, order.order_number, str(int(order.total)))
            except Exception:
                pass

        return Response(
            OrderSerializer(order, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


# ---------------------------------------------------------------------------
# Coupon validation
# ---------------------------------------------------------------------------

class CouponValidateView(APIView):
    """
    POST /api/orders/coupons/validate/
    Validate a coupon code and return discount details.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CouponValidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        coupon = serializer.validated_data['coupon']
        order_amount = serializer.validated_data.get('order_amount', 0)
        discount = coupon.calculate_discount(order_amount)
        return Response(
            {
                'code': coupon.code,
                'discount_type': coupon.discount_type,
                'discount_value': coupon.discount_value,
                'discount_amount': discount,
                'message': 'کد تخفیف معتبر است.',
            }
        )


# ---------------------------------------------------------------------------
# Shipping methods
# ---------------------------------------------------------------------------

class ShippingMethodListView(APIView):
    """GET /api/orders/shipping/ – list enabled shipping methods."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from apps.cms.models import ShippingMethod
        methods = ShippingMethod.objects.filter(is_enabled=True)
        serializer = ShippingMethodSerializer(methods, many=True)
        return Response(serializer.data)


# ---------------------------------------------------------------------------
# Online payment
# ---------------------------------------------------------------------------

class PaymentInitiateView(APIView):
    """
    POST /api/orders/<id>/pay/
    Initiate online payment for a pending order.
    Returns {redirect_url} to which the frontend should redirect the user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk=None):
        order = get_object_or_404(Order, pk=pk, user=request.user)
        if order.status != 'pending':
            return Response({'detail': 'این سفارش قابل پرداخت نیست.'}, status=status.HTTP_400_BAD_REQUEST)
        if order.payment_method != 'online':
            return Response({'detail': 'روش پرداخت این سفارش آنلاین نیست.'}, status=status.HTTP_400_BAD_REQUEST)

        # Build callback URL: absolute URL pointing to our callback view
        callback_url = request.build_absolute_uri(f'/api/orders/payment/callback/?order_id={order.id}')

        adapter = get_payment_adapter()
        result = adapter.request_payment(order, callback_url)

        if result['status'] == 'ok':
            # Store authority/id so we can match on callback
            Order.objects.filter(pk=order.pk).update(transaction_id=result.get('authority', ''))
            return Response({'redirect_url': result['redirect_url'], 'message': result['message']})

        return Response({'detail': result['message']}, status=status.HTTP_502_BAD_GATEWAY)


class PaymentCallbackView(APIView):
    """
    GET /api/orders/payment/callback/
    Payment gateway callback — verifies payment and updates order status.
    Redirects user's browser to the frontend result page.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return self._handle(request)

    def post(self, request):
        return self._handle(request)

    def _handle(self, request):
        params = {**request.GET.dict(), **request.data} if hasattr(request, 'data') else request.GET.dict()
        order_id = params.get('order_id')
        frontend_base = getattr(django_settings, 'FRONTEND_URL', '')

        if not order_id:
            return redirect(f'{frontend_base}/profile?payment=failed')

        try:
            order = Order.objects.get(pk=order_id, status='pending', payment_method='online')
        except Order.DoesNotExist:
            return redirect(f'{frontend_base}/profile?payment=failed')

        adapter = get_payment_adapter()
        result = adapter.verify_payment(order, params)

        if result['status'] == 'ok':
            Order.objects.filter(pk=order.pk).update(
                status='paid',
                transaction_id=result.get('transaction_id', order.transaction_id),
                paid_at=timezone.now(),
            )
            # Reload to get updated instance for SMS
            order.refresh_from_db()
            try:
                from .sms import get_sms_adapter
                sms = get_sms_adapter()
                sms.send_order_confirmation(order.phone, order.order_number, str(int(order.total)))
            except Exception:
                pass
            return redirect(f'{frontend_base}/profile?payment=success&order={order.order_number}')

        return redirect(f'{frontend_base}/profile?payment=failed&order={order.order_number}')
