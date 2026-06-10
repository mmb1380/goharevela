"""
Wagtail CMS page models for گوهر ولا.
"""
from django import forms
from django.db import models
from modelcluster.contrib.taggit import ClusterTaggableManager
from modelcluster.fields import ParentalKey, ParentalManyToManyField
from modelcluster.models import ClusterableModel
from taggit.models import TaggedItemBase
from wagtail.admin.panels import FieldPanel, InlinePanel, MultiFieldPanel, ObjectList, TabbedInterface
from wagtail.api import APIField
from wagtail.contrib.settings.models import BaseGenericSetting, register_setting
from wagtail.blocks import (
    CharBlock,
    RichTextBlock,
    StructBlock,
    TextBlock,
)
from wagtail.fields import RichTextField, StreamField
from wagtail.images.blocks import ImageChooserBlock
from wagtail.models import Orderable, Page
from wagtail.search import index
from wagtail.snippets.models import register_snippet

from .blocks import HOME_BLOCKS


# ---------------------------------------------------------------------------
# Snippets
# ---------------------------------------------------------------------------

@register_snippet
class FooterText(models.Model):
    """Editable footer text snippet."""
    body = RichTextField(verbose_name='متن فوتر')

    panels = [FieldPanel('body')]

    class Meta:
        verbose_name = 'متن فوتر'
        verbose_name_plural = 'متن‌های فوتر'

    def __str__(self):
        return 'متن فوتر'


@register_setting
class SiteSettings(BaseGenericSetting):
    """تنظیمات سراسری سایت (برند، تماس، شبکه‌های اجتماعی، نوار بالا)."""

    # برند
    brand_name = models.CharField(max_length=100, default='گوهر ولا', verbose_name='نام برند')
    brand_latin = models.CharField(max_length=100, blank=True, default='GOHAREVELA', verbose_name='نام لاتین برند')
    brand_description = models.TextField(blank=True, verbose_name='توضیح برند (فوتر)')

    # تماس
    phone_primary = models.CharField(max_length=20, blank=True, verbose_name='تلفن ثابت')
    phone_secondary = models.CharField(max_length=20, blank=True, verbose_name='تلفن همراه')
    email = models.EmailField(blank=True, verbose_name='ایمیل')
    address = models.TextField(blank=True, verbose_name='آدرس')
    working_hours = models.CharField(max_length=200, blank=True, verbose_name='ساعت کاری')

    # شبکه‌های اجتماعی
    instagram = models.URLField(blank=True, verbose_name='اینستاگرام')
    telegram = models.URLField(blank=True, verbose_name='تلگرام')
    whatsapp = models.URLField(blank=True, verbose_name='واتس‌اپ')
    aparat = models.URLField(blank=True, verbose_name='آپارات')

    # نوار بالای هدر
    topbar_message = models.CharField(max_length=200, blank=True, verbose_name='پیام نوار بالا')

    panels = [
        MultiFieldPanel([
            FieldPanel('brand_name'),
            FieldPanel('brand_latin'),
            FieldPanel('brand_description'),
        ], heading='برند'),
        MultiFieldPanel([
            FieldPanel('phone_primary'),
            FieldPanel('phone_secondary'),
            FieldPanel('email'),
            FieldPanel('address'),
            FieldPanel('working_hours'),
        ], heading='اطلاعات تماس'),
        MultiFieldPanel([
            FieldPanel('instagram'),
            FieldPanel('telegram'),
            FieldPanel('whatsapp'),
            FieldPanel('aparat'),
        ], heading='شبکه‌های اجتماعی'),
        FieldPanel('topbar_message'),
    ]

    class Meta:
        verbose_name = 'تنظیمات سایت'


@register_setting
class PaymentSettings(BaseGenericSetting):
    """تنظیمات درگاه پرداخت."""

    PROVIDER_CHOICES = [
        ('zarinpal', 'زرین‌پال'),
        ('idpay', 'آی‌دی‌پی'),
    ]

    online_enabled = models.BooleanField(
        default=False,
        verbose_name='پرداخت آنلاین فعال',
        help_text='گزینه پرداخت آنلاین در سبد خرید نمایش داده شود.',
    )
    provider = models.CharField(
        max_length=20,
        choices=PROVIDER_CHOICES,
        default='zarinpal',
        verbose_name='درگاه پرداخت',
    )
    merchant_id = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='کد پذیرنده / API Key',
        help_text='زرین‌پال: Merchant ID — آی‌دی‌پی: API Key',
    )
    sandbox = models.BooleanField(
        default=True,
        verbose_name='حالت آزمایشی (Sandbox)',
        help_text='در حالت آزمایشی پرداخت واقعی انجام نمی‌شود.',
    )
    card_to_card_enabled = models.BooleanField(
        default=True,
        verbose_name='کارت به کارت فعال',
    )
    card_number = models.CharField(
        max_length=25,
        blank=True,
        verbose_name='شماره کارت',
        help_text='مثال: 6037-9970-XXXX-XXXX',
    )
    card_holder = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='نام صاحب کارت',
    )

    panels = [
        MultiFieldPanel([
            FieldPanel('online_enabled'),
            FieldPanel('provider'),
            FieldPanel('merchant_id'),
            FieldPanel('sandbox'),
        ], heading='پرداخت آنلاین'),
        MultiFieldPanel([
            FieldPanel('card_to_card_enabled'),
            FieldPanel('card_number'),
            FieldPanel('card_holder'),
        ], heading='کارت به کارت'),
    ]

    class Meta:
        verbose_name = 'تنظیمات پرداخت'


@register_setting
class SmsSettings(BaseGenericSetting):
    """تنظیمات ارسال پیامک."""

    PROVIDER_CHOICES = [
        ('kavenegar', 'کاوه‌نگار'),
        ('smsir', 'اس‌ام‌اس.آی‌آر'),
    ]

    enabled = models.BooleanField(default=False, verbose_name='پیامک فعال')
    provider = models.CharField(
        max_length=20,
        choices=PROVIDER_CHOICES,
        default='kavenegar',
        verbose_name='سرویس پیامک',
    )
    api_key = models.CharField(max_length=300, blank=True, verbose_name='API Key')
    sender = models.CharField(
        max_length=20,
        blank=True,
        verbose_name='شماره فرستنده',
        help_text='در صورت داشتن خط اختصاصی وارد کنید.',
    )
    otp_template = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='نام قالب OTP',
        help_text='نام قالب پیامک تأیید هویت (مثال: verify-code)',
    )
    order_confirm_template = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='نام قالب تأیید سفارش',
    )

    panels = [
        FieldPanel('enabled'),
        FieldPanel('provider'),
        FieldPanel('api_key'),
        FieldPanel('sender'),
        MultiFieldPanel([
            FieldPanel('otp_template'),
            FieldPanel('order_confirm_template'),
        ], heading='قالب‌های پیامک'),
    ]

    class Meta:
        verbose_name = 'تنظیمات پیامک'


@register_snippet
class ShippingMethod(models.Model):
    """روش ارسال — قابل مدیریت از پنل Wagtail."""

    name = models.CharField(max_length=100, verbose_name='نام روش ارسال')
    description = models.CharField(max_length=300, blank=True, verbose_name='توضیح')
    price = models.DecimalField(
        max_digits=10,
        decimal_places=0,
        verbose_name='هزینه ارسال (تومان)',
    )
    free_above = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        default=0,
        verbose_name='ارسال رایگان بالای (تومان)',
        help_text='اگر مبلغ سبد از این رقم بیشتر باشد هزینه ارسال صفر می‌شود. ۰ یعنی ارسال رایگان نداریم.',
    )
    estimated_days = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='زمان تحویل',
        help_text='مثال: ۳ تا ۵ روز کاری',
    )
    is_enabled = models.BooleanField(default=True, verbose_name='فعال')
    sort_order = models.PositiveSmallIntegerField(default=0, verbose_name='ترتیب نمایش')

    panels = [
        FieldPanel('name'),
        FieldPanel('description'),
        FieldPanel('price'),
        FieldPanel('free_above'),
        FieldPanel('estimated_days'),
        FieldPanel('is_enabled'),
        FieldPanel('sort_order'),
    ]

    class Meta:
        verbose_name = 'روش ارسال'
        verbose_name_plural = 'روش‌های ارسال'
        ordering = ['sort_order', 'id']

    def __str__(self):
        return self.name


@register_snippet
class Menu(ClusterableModel):
    """منوی قابل‌ویرایش (هدر، فوتر) با آیتم‌های قابل‌جابجایی."""

    HANDLE_CHOICES = [
        ('main', 'منوی اصلی (هدر)'),
        ('footer_quick', 'دسترسی سریع (فوتر)'),
        ('footer_bottom', 'لینک‌های پایین (فوتر)'),
    ]

    title = models.CharField(max_length=100, verbose_name='عنوان')
    handle = models.SlugField(
        unique=True,
        choices=HANDLE_CHOICES,
        verbose_name='شناسه',
        help_text='تعیین می‌کند این منو کجای سایت نمایش داده شود.',
    )

    panels = [
        FieldPanel('title'),
        FieldPanel('handle'),
        InlinePanel('items', label='آیتم‌ها'),
    ]

    class Meta:
        verbose_name = 'منو'
        verbose_name_plural = 'منوها'

    def __str__(self):
        return self.title


class MenuItem(Orderable):
    """یک آیتم منو."""

    menu = ParentalKey(Menu, on_delete=models.CASCADE, related_name='items')
    label = models.CharField(max_length=100, verbose_name='متن')
    link = models.CharField(max_length=300, verbose_name='لینک', help_text='مثال: /products یا /blog')
    open_in_new_tab = models.BooleanField(default=False, verbose_name='باز شدن در تب جدید')

    panels = [
        FieldPanel('label'),
        FieldPanel('link'),
        FieldPanel('open_in_new_tab'),
    ]

    def __str__(self):
        return self.label


# ---------------------------------------------------------------------------
# Home page
# ---------------------------------------------------------------------------

class HomePage(Page):
    """Landing page for the store."""

    hero_title = models.CharField(
        max_length=255,
        default='گوهر ولا',
        verbose_name='عنوان بنر',
    )
    hero_subtitle = models.CharField(
        max_length=500,
        blank=True,
        verbose_name='زیرعنوان بنر',
    )
    hero_button_text = models.CharField(
        max_length=100,
        default='مشاهده محصولات',
        verbose_name='متن دکمه بنر',
    )
    hero_image = models.ForeignKey(
        'wagtailimages.Image',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+',
        verbose_name='تصویر بنر',
    )
    intro_text = RichTextField(blank=True, verbose_name='متن معرفی')
    about_section = RichTextField(blank=True, verbose_name='درباره ما')

    # بخش‌های قابل‌ویرایش و جابجاشونده صفحه اصلی
    body = StreamField(
        HOME_BLOCKS,
        blank=True,
        use_json_field=True,
        verbose_name='بخش‌های صفحه اصلی',
        help_text='هر بخش را می‌توانید ویرایش، جابجا، اضافه یا حذف کنید.',
    )

    content_panels = Page.content_panels + [
        MultiFieldPanel([
            FieldPanel('hero_title'),
            FieldPanel('hero_subtitle'),
            FieldPanel('hero_button_text'),
            FieldPanel('hero_image'),
        ], heading='بنر اصلی (قدیمی)'),
        FieldPanel('intro_text'),
        FieldPanel('about_section'),
        FieldPanel('body'),
    ]

    api_fields = [
        APIField('hero_title'),
        APIField('hero_subtitle'),
        APIField('hero_button_text'),
        APIField('intro_text'),
        APIField('about_section'),
        APIField('body'),
    ]

    class Meta:
        verbose_name = 'صفحه اصلی'

    def get_context(self, request, *args, **kwargs):
        context = super().get_context(request, *args, **kwargs)
        context['blog_posts'] = BlogPage.objects.live().order_by('-date')[:3]
        return context


# ---------------------------------------------------------------------------
# Blog
# ---------------------------------------------------------------------------

class BlogPageTag(TaggedItemBase):
    content_object = ParentalKey(
        'BlogPage',
        related_name='tagged_items',
        on_delete=models.CASCADE,
    )


class BlogIndexPage(Page):
    """Listing page for all blog posts."""

    intro = RichTextField(blank=True, verbose_name='مقدمه')

    content_panels = Page.content_panels + [
        FieldPanel('intro'),
    ]

    api_fields = [
        APIField('intro'),
    ]

    class Meta:
        verbose_name = 'فهرست مقالات'
        verbose_name_plural = 'فهرست مقالات'

    def get_context(self, request, *args, **kwargs):
        context = super().get_context(request, *args, **kwargs)
        posts = BlogPage.objects.child_of(self).live().order_by('-date')
        # Tag filter
        tag = request.GET.get('tag')
        if tag:
            posts = posts.filter(tags__name=tag)
        context['posts'] = posts
        return context

    subpage_types = ['cms.BlogPage']


class BlogPage(Page):
    """Individual blog post."""

    date = models.DateField(verbose_name='تاریخ انتشار')
    intro = models.CharField(max_length=400, verbose_name='خلاصه مقاله')
    author = models.CharField(max_length=100, blank=True, default='گوهر ولا', verbose_name='نویسنده')
    cover_image = models.ForeignKey(
        'wagtailimages.Image',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+',
        verbose_name='تصویر شاخص',
    )
    tags = ClusterTaggableManager(through=BlogPageTag, blank=True, verbose_name='برچسب‌ها')
    body = StreamField(
        [
            ('heading', CharBlock(form_classname='title', label='عنوان')),
            ('paragraph', RichTextBlock(label='متن')),
            ('image', ImageChooserBlock(label='تصویر')),
            ('quote', StructBlock(
                [
                    ('text', TextBlock(label='متن نقل‌قول')),
                    ('author', CharBlock(required=False, label='گوینده')),
                ],
                label='نقل‌قول',
            )),
        ],
        verbose_name='محتوای مقاله',
        use_json_field=True,
    )

    search_fields = Page.search_fields + [
        index.SearchField('intro'),
        index.SearchField('body'),
        index.FilterField('date'),
    ]

    content_panels = Page.content_panels + [
        MultiFieldPanel([
            FieldPanel('date'),
            FieldPanel('author'),
            FieldPanel('tags'),
        ], heading='اطلاعات مقاله'),
        FieldPanel('cover_image'),
        FieldPanel('intro'),
        FieldPanel('body'),
    ]

    api_fields = [
        APIField('date'),
        APIField('intro'),
        APIField('author'),
        APIField('body'),
    ]

    class Meta:
        verbose_name = 'مقاله'
        verbose_name_plural = 'مقالات'

    parent_page_types = ['cms.BlogIndexPage']
    subpage_types = []
