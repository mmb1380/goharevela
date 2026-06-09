"""
Product models for گوهر ولا.
"""
from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=200, verbose_name='نام دسته‌بندی')
    slug = models.SlugField(max_length=220, unique=True, allow_unicode=True, verbose_name='اسلاگ')
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='children',
        verbose_name='دسته‌بندی والد',
    )
    image = models.ImageField(
        upload_to='categories/',
        blank=True,
        verbose_name='تصویر',
    )
    icon = models.CharField(
        max_length=10,
        blank=True,
        verbose_name='آیکن (اموجی)',
        help_text='مثال: 💍',
    )
    description = models.TextField(blank=True, verbose_name='توضیحات')
    is_active = models.BooleanField(default=True, verbose_name='فعال')
    order = models.PositiveIntegerField(default=0, verbose_name='ترتیب نمایش')

    class Meta:
        verbose_name = 'دسته‌بندی'
        verbose_name_plural = 'دسته‌بندی‌ها'
        ordering = ['order', 'name']

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
        super().save(*args, **kwargs)

    def get_ancestors(self):
        """Return list of ancestor categories from root to parent."""
        ancestors = []
        current = self.parent
        while current is not None:
            ancestors.insert(0, current)
            current = current.parent
        return ancestors


class StoneType(models.Model):
    name = models.CharField(max_length=100, verbose_name='نام سنگ')
    slug = models.SlugField(max_length=120, unique=True, allow_unicode=True, verbose_name='اسلاگ')
    description = models.TextField(blank=True, verbose_name='توضیحات')
    origin = models.CharField(max_length=100, blank=True, verbose_name='منشأ', help_text='مثال: یمن، نیشابور')
    image = models.ImageField(upload_to='stones/', blank=True, verbose_name='تصویر')
    is_active = models.BooleanField(default=True, verbose_name='فعال')

    class Meta:
        verbose_name = 'نوع سنگ'
        verbose_name_plural = 'انواع سنگ'
        ordering = ['name']

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
        super().save(*args, **kwargs)


class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name='نام')
    slug = models.SlugField(max_length=120, unique=True, allow_unicode=True, verbose_name='اسلاگ')

    class Meta:
        verbose_name = 'برچسب'
        verbose_name_plural = 'برچسب‌ها'
        ordering = ['name']

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
        super().save(*args, **kwargs)


class Product(models.Model):
    SILVER_GRADE_CHOICES = [
        ('925', '925 – نقره استرلینگ'),
        ('835', '835 – نقره اروپایی'),
        ('999', '999 – نقره خالص'),
    ]
    STATUS_CHOICES = [
        ('active', 'فعال'),
        ('inactive', 'غیرفعال'),
        ('out_of_stock', 'ناموجود'),
    ]

    name = models.CharField(max_length=300, verbose_name='نام محصول')
    slug = models.SlugField(max_length=320, unique=True, allow_unicode=True, verbose_name='اسلاگ')
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='products',
        verbose_name='دسته‌بندی',
    )
    stone_type = models.ForeignKey(
        StoneType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products',
        verbose_name='نوع سنگ',
    )
    tags = models.ManyToManyField(Tag, blank=True, verbose_name='برچسب‌ها')

    description = models.TextField(verbose_name='توضیحات کامل')
    short_description = models.CharField(
        max_length=300,
        blank=True,
        verbose_name='توضیح کوتاه',
    )

    # Pricing (all in Tomans)
    price = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        verbose_name='قیمت (تومان)',
    )
    compare_price = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        null=True,
        blank=True,
        verbose_name='قیمت قبل از تخفیف (تومان)',
    )
    cost_price = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        null=True,
        blank=True,
        verbose_name='قیمت تمام‌شده (تومان)',
        help_text='فقط برای مدیران قابل مشاهده است.',
    )

    # Product identifiers & physical specs
    sku = models.CharField(
        max_length=100,
        unique=True,
        blank=True,
        verbose_name='کد محصول (SKU)',
    )
    weight = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='وزن کل (گرم)',
    )
    silver_weight = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='وزن نقره (گرم)',
    )
    silver_grade = models.CharField(
        max_length=3,
        choices=SILVER_GRADE_CHOICES,
        blank=True,
        verbose_name='عیار نقره',
    )

    stock = models.PositiveIntegerField(default=0, verbose_name='موجودی انبار')
    is_featured = models.BooleanField(default=False, verbose_name='ویژه / پیشنهاد ویژه')
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        verbose_name='وضعیت',
    )

    views_count = models.PositiveIntegerField(default=0, editable=False, verbose_name='تعداد بازدید')
    sales_count = models.PositiveIntegerField(default=0, editable=False, verbose_name='تعداد فروش')

    # SEO
    meta_title = models.CharField(max_length=200, blank=True, verbose_name='عنوان متا')
    meta_description = models.TextField(blank=True, verbose_name='توضیحات متا')

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ایجاد')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاریخ بروزرسانی')

    class Meta:
        verbose_name = 'محصول'
        verbose_name_plural = 'محصولات'
        ordering = ['-created_at']

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
        if not self.sku:
            import uuid
            self.sku = f'HS-{uuid.uuid4().hex[:8].upper()}'
        super().save(*args, **kwargs)

    @property
    def discount_percent(self) -> int:
        """Return discount percentage or 0 if no compare_price set."""
        if self.compare_price and self.compare_price > self.price:
            return int((1 - self.price / self.compare_price) * 100)
        return 0

    @property
    def is_available(self) -> bool:
        return self.status == 'active' and self.stock > 0

    def get_primary_image(self):
        return self.images.filter(is_primary=True).first() or self.images.first()

    def average_rating(self):
        approved = self.reviews.filter(is_approved=True)
        if not approved.exists():
            return None
        total = sum(r.rating for r in approved)
        return round(total / approved.count(), 1)


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name='محصول',
    )
    image = models.ImageField(upload_to='products/', verbose_name='تصویر')
    alt_text = models.CharField(max_length=200, blank=True, verbose_name='متن جایگزین')
    is_primary = models.BooleanField(default=False, verbose_name='تصویر اصلی')
    order = models.PositiveIntegerField(default=0, verbose_name='ترتیب')

    class Meta:
        verbose_name = 'تصویر محصول'
        verbose_name_plural = 'تصاویر محصول'
        ordering = ['order', 'id']

    def __str__(self) -> str:
        return f'تصویر {self.product.name} – #{self.pk}'


class ProductReview(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name='محصول',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name='کاربر',
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='امتیاز',
    )
    title = models.CharField(max_length=200, blank=True, verbose_name='عنوان نظر')
    body = models.TextField(verbose_name='متن نظر')
    is_approved = models.BooleanField(default=False, verbose_name='تأیید شده')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ثبت')

    class Meta:
        verbose_name = 'نظر محصول'
        verbose_name_plural = 'نظرات محصولات'
        unique_together = [('product', 'user')]
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'نظر {self.user} برای {self.product.name}'
