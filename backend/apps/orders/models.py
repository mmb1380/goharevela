"""
Order-related models for حجره شوشتری.
"""
import uuid
from decimal import Decimal

from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.products.models import Product


def generate_order_number() -> str:
    """Generate a unique, human-readable order number."""
    timestamp = timezone.now().strftime('%Y%m%d%H%M')
    uid = uuid.uuid4().hex[:6].upper()
    return f'HS-{timestamp}-{uid}'


class Cart(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='carts',
        verbose_name='کاربر',
    )
    session_key = models.CharField(
        max_length=40,
        blank=True,
        db_index=True,
        verbose_name='کلید جلسه',
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاریخ بروزرسانی')

    class Meta:
        verbose_name = 'سبد خرید'
        verbose_name_plural = 'سبدهای خرید'

    def __str__(self) -> str:
        if self.user:
            return f'سبد {self.user}'
        return f'سبد ناشناس ({self.session_key})'

    @property
    def total(self) -> Decimal:
        return sum(item.subtotal for item in self.items.select_related('product').all())

    @property
    def item_count(self) -> int:
        return self.items.count()


class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='سبد خرید',
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='cart_items',
        verbose_name='محصول',
    )
    quantity = models.PositiveIntegerField(default=1, verbose_name='تعداد')

    class Meta:
        verbose_name = 'آیتم سبد'
        verbose_name_plural = 'آیتم‌های سبد'
        unique_together = [('cart', 'product')]

    def __str__(self) -> str:
        return f'{self.quantity}x {self.product.name}'

    @property
    def subtotal(self) -> Decimal:
        return self.product.price * self.quantity


class Coupon(models.Model):
    DISCOUNT_TYPE_CHOICES = [
        ('percent', 'درصدی'),
        ('fixed', 'مبلغ ثابت'),
    ]

    code = models.CharField(max_length=50, unique=True, verbose_name='کد تخفیف')
    discount_type = models.CharField(
        max_length=10,
        choices=DISCOUNT_TYPE_CHOICES,
        default='percent',
        verbose_name='نوع تخفیف',
    )
    discount_value = models.DecimalField(
        max_digits=10,
        decimal_places=0,
        verbose_name='مقدار تخفیف',
    )
    min_order_amount = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        default=0,
        verbose_name='حداقل مبلغ سفارش (تومان)',
    )
    max_uses = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name='حداکثر تعداد استفاده',
    )
    used_count = models.PositiveIntegerField(default=0, verbose_name='تعداد استفاده‌شده')
    is_active = models.BooleanField(default=True, verbose_name='فعال')
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name='تاریخ انقضا')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'کد تخفیف'
        verbose_name_plural = 'کدهای تخفیف'

    def __str__(self) -> str:
        return self.code

    def is_valid(self, order_amount: Decimal = Decimal('0')) -> tuple[bool, str]:
        """
        Check if coupon is valid for the given order amount.
        Returns (is_valid, message).
        """
        if not self.is_active:
            return False, 'این کد تخفیف فعال نیست.'
        if self.expires_at and timezone.now() > self.expires_at:
            return False, 'این کد تخفیف منقضی شده است.'
        if self.max_uses is not None and self.used_count >= self.max_uses:
            return False, 'ظرفیت این کد تخفیف تمام شده است.'
        if order_amount < self.min_order_amount:
            return False, f'حداقل مبلغ سفارش برای این کد تخفیف {self.min_order_amount:,} تومان است.'
        return True, 'کد تخفیف معتبر است.'

    def calculate_discount(self, order_amount: Decimal) -> Decimal:
        """Return the discount amount for the given order total."""
        if self.discount_type == 'percent':
            return (order_amount * self.discount_value / 100).quantize(Decimal('1'))
        return min(self.discount_value, order_amount)


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'در انتظار پرداخت'),
        ('paid', 'پرداخت شده'),
        ('processing', 'در حال آماده‌سازی'),
        ('shipped', 'ارسال شده'),
        ('delivered', 'تحویل داده شده'),
        ('cancelled', 'لغو شده'),
        ('refunded', 'مرجوع شده'),
    ]
    PAYMENT_METHOD_CHOICES = [
        ('online', 'پرداخت آنلاین'),
        ('card_to_card', 'کارت به کارت'),
    ]

    order_number = models.CharField(
        max_length=30,
        unique=True,
        editable=False,
        verbose_name='شماره سفارش',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders',
        verbose_name='کاربر',
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='وضعیت',
    )

    # Denormalized customer information (snapshot at order time)
    full_name = models.CharField(max_length=200, verbose_name='نام و نام خانوادگی')
    phone = models.CharField(max_length=11, verbose_name='شماره موبایل')
    email = models.EmailField(blank=True, verbose_name='ایمیل')
    address = models.TextField(verbose_name='آدرس')
    city = models.CharField(max_length=100, verbose_name='شهر')
    postal_code = models.CharField(max_length=10, verbose_name='کد پستی')

    # Pricing
    subtotal = models.DecimalField(max_digits=12, decimal_places=0, verbose_name='جمع محصولات')
    shipping_cost = models.DecimalField(
        max_digits=10, decimal_places=0, default=0, verbose_name='هزینه ارسال'
    )
    discount_amount = models.DecimalField(
        max_digits=12, decimal_places=0, default=0, verbose_name='مبلغ تخفیف'
    )
    total = models.DecimalField(max_digits=12, decimal_places=0, verbose_name='مبلغ کل')

    coupon = models.ForeignKey(
        Coupon,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders',
        verbose_name='کد تخفیف',
    )

    # Payment
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        verbose_name='روش پرداخت',
    )
    transaction_id = models.CharField(max_length=200, blank=True, verbose_name='شناسه تراکنش')
    paid_at = models.DateTimeField(null=True, blank=True, verbose_name='تاریخ پرداخت')

    notes = models.TextField(blank=True, verbose_name='توضیحات سفارش')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ثبت')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاریخ بروزرسانی')

    class Meta:
        verbose_name = 'سفارش'
        verbose_name_plural = 'سفارشات'
        ordering = ['-created_at']

    def __str__(self) -> str:
        return self.order_number

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = generate_order_number()
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='سفارش',
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        related_name='order_items',
        verbose_name='محصول',
    )
    # Snapshot fields (product may be deleted/changed later)
    product_name = models.CharField(max_length=300, verbose_name='نام محصول')
    product_sku = models.CharField(max_length=100, blank=True, verbose_name='کد محصول')
    price = models.DecimalField(max_digits=12, decimal_places=0, verbose_name='قیمت واحد')
    quantity = models.PositiveIntegerField(default=1, verbose_name='تعداد')

    class Meta:
        verbose_name = 'آیتم سفارش'
        verbose_name_plural = 'آیتم‌های سفارش'

    def __str__(self) -> str:
        return f'{self.quantity}x {self.product_name}'

    @property
    def subtotal(self) -> Decimal:
        return self.price * self.quantity
