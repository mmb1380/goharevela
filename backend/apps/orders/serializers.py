"""
Serializers for the orders app.
"""
from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from apps.products.models import Product
from apps.products.serializers import ProductListSerializer

from .models import Cart, CartItem, Coupon, Order, OrderItem


# ---------------------------------------------------------------------------
# Cart serializers
# ---------------------------------------------------------------------------

class CartItemProductSerializer(serializers.ModelSerializer):
    """Compact product info for cart display."""
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'price', 'compare_price', 'stock', 'status', 'primary_image']

    def get_primary_image(self, obj):
        img = obj.get_primary_image()
        if img:
            request = self.context.get('request')
            return request.build_absolute_uri(img.image.url) if request else img.image.url
        return None


class CartItemSerializer(serializers.ModelSerializer):
    product = CartItemProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(status='active'),
        source='product',
        write_only=True,
    )
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'subtotal']

    def get_subtotal(self, obj):
        return obj.subtotal

    def validate(self, attrs):
        product = attrs.get('product')
        quantity = attrs.get('quantity', 1)
        if product and product.stock < quantity:
            raise serializers.ValidationError(
                f'موجودی کافی نیست. موجودی فعلی: {product.stock} عدد.'
            )
        return attrs


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total', 'item_count', 'updated_at']

    def get_total(self, obj):
        return obj.total

    def get_item_count(self, obj):
        return obj.item_count


# ---------------------------------------------------------------------------
# Coupon serializers
# ---------------------------------------------------------------------------

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'discount_type', 'discount_value',
            'min_order_amount', 'is_active', 'expires_at',
        ]
        read_only_fields = fields


class CouponValidateSerializer(serializers.Serializer):
    code = serializers.CharField(label='کد تخفیف')
    order_amount = serializers.DecimalField(
        max_digits=12, decimal_places=0, required=False, default=0
    )

    def validate(self, attrs):
        code = attrs['code'].upper().strip()
        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            raise serializers.ValidationError({'code': 'کد تخفیف یافت نشد.'})

        is_valid, message = coupon.is_valid(attrs.get('order_amount', Decimal('0')))
        if not is_valid:
            raise serializers.ValidationError({'code': message})

        attrs['coupon'] = coupon
        return attrs


# ---------------------------------------------------------------------------
# Order serializers
# ---------------------------------------------------------------------------

class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_sku',
            'price', 'quantity', 'subtotal',
        ]

    def get_subtotal(self, obj):
        return obj.subtotal


class OrderSerializer(serializers.ModelSerializer):
    """Read serializer for order list and detail."""
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(
        source='get_payment_method_display', read_only=True
    )

    class Meta:
        model = Order
        fields = [
            'id', 'order_number',
            'status', 'status_display',
            'full_name', 'phone', 'email', 'address', 'city', 'postal_code',
            'subtotal', 'shipping_cost', 'discount_amount', 'total',
            'payment_method', 'payment_method_display', 'transaction_id', 'paid_at',
            'notes', 'items',
            'created_at', 'updated_at',
        ]
        read_only_fields = fields


class ShippingMethodSerializer(serializers.Serializer):
    """Read serializer for shipping methods exposed to the frontend."""
    id = serializers.IntegerField()
    name = serializers.CharField()
    description = serializers.CharField()
    price = serializers.DecimalField(max_digits=10, decimal_places=0)
    free_above = serializers.DecimalField(max_digits=12, decimal_places=0)
    estimated_days = serializers.CharField()
    is_enabled = serializers.BooleanField()


class OrderCreateSerializer(serializers.Serializer):
    """Write serializer for creating an order from the current cart."""

    full_name = serializers.CharField(max_length=200, label='نام و نام خانوادگی')
    phone = serializers.RegexField(
        regex=r'^09[0-9]{9}$',
        label='شماره موبایل',
        error_messages={'invalid': 'شماره موبایل معتبر نیست.'},
    )
    email = serializers.EmailField(required=False, allow_blank=True, label='ایمیل')
    address = serializers.CharField(label='آدرس')
    city = serializers.CharField(max_length=100, label='شهر')
    postal_code = serializers.CharField(max_length=10, label='کد پستی')
    payment_method = serializers.ChoiceField(
        choices=Order.PAYMENT_METHOD_CHOICES,
        label='روش پرداخت',
    )
    shipping_method_id = serializers.IntegerField(required=False, allow_null=True, label='روش ارسال')
    coupon_code = serializers.CharField(
        required=False,
        allow_blank=True,
        label='کد تخفیف',
    )
    notes = serializers.CharField(required=False, allow_blank=True, label='توضیحات')

    def validate_postal_code(self, value: str) -> str:
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError('کد پستی باید ۱۰ رقم باشد.')
        return value

    def validate(self, attrs):
        # Validate coupon if provided
        coupon_code = attrs.get('coupon_code', '').strip().upper()
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code)
            except Coupon.DoesNotExist:
                raise serializers.ValidationError({'coupon_code': 'کد تخفیف معتبر نیست.'})
            attrs['coupon'] = coupon
        else:
            attrs['coupon'] = None
        return attrs

    @transaction.atomic
    def create_order(self, cart: Cart) -> Order:
        """Build an Order from the given Cart and validated data."""
        data = self.validated_data
        items = list(cart.items.select_related('product').all())
        if not items:
            raise serializers.ValidationError('سبد خرید خالی است.')

        # Verify stock
        for item in items:
            product = item.product
            if not product.is_available:
                raise serializers.ValidationError(
                    f'محصول «{product.name}» در حال حاضر موجود نیست.'
                )
            if product.stock < item.quantity:
                raise serializers.ValidationError(
                    f'موجودی محصول «{product.name}» کافی نیست. موجودی: {product.stock}'
                )

        subtotal = sum(item.subtotal for item in items)

        # Resolve shipping cost from selected ShippingMethod (if any)
        shipping_cost = Decimal('0')
        shipping_method_id = data.get('shipping_method_id')
        if shipping_method_id:
            try:
                from apps.cms.models import ShippingMethod
                sm = ShippingMethod.objects.get(pk=shipping_method_id, is_enabled=True)
                shipping_cost = sm.price if (sm.free_above == 0 or subtotal < sm.free_above) else Decimal('0')
            except Exception:
                pass

        coupon = data.get('coupon')
        discount_amount = Decimal('0')

        if coupon:
            is_valid, message = coupon.is_valid(subtotal)
            if not is_valid:
                raise serializers.ValidationError({'coupon_code': message})
            discount_amount = coupon.calculate_discount(subtotal)

        total = subtotal + shipping_cost - discount_amount

        order = Order.objects.create(
            user=cart.user,
            full_name=data['full_name'],
            phone=data['phone'],
            email=data.get('email', ''),
            address=data['address'],
            city=data['city'],
            postal_code=data['postal_code'],
            payment_method=data['payment_method'],
            notes=data.get('notes', ''),
            coupon=coupon,
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            discount_amount=discount_amount,
            total=total,
        )

        # Create order items and decrement stock
        for item in items:
            product = item.product
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                product_sku=product.sku,
                price=product.price,
                quantity=item.quantity,
            )
            Product.objects.filter(pk=product.pk).update(
                stock=product.stock - item.quantity
            )

        # Increment coupon usage
        if coupon:
            Coupon.objects.filter(pk=coupon.pk).update(used_count=coupon.used_count + 1)

        # Clear the cart
        cart.items.all().delete()

        return order
