"""
Views for the orders app.
"""
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.products.models import Product

from .models import Cart, CartItem, Order
from .serializers import (
    CartItemSerializer,
    CartSerializer,
    CouponValidateSerializer,
    OrderCreateSerializer,
    OrderSerializer,
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
