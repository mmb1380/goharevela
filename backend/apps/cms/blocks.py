"""
StreamField blocks for the editable home page.

Each block represents one section of the landing page so that the whole
home page can be edited and re-ordered from the Wagtail admin (`/cms/`)
without touching code.
"""
from wagtail.blocks import (
    CharBlock,
    ChoiceBlock,
    ListBlock,
    StructBlock,
    TextBlock,
)

# آیکن‌های مجاز برای نوار اعتماد (به آیکن‌های lucide در فرانت نگاشت می‌شوند)
TRUST_ICON_CHOICES = [
    ('shield', 'سپر / ضمانت'),
    ('truck', 'کامیون / ارسال'),
    ('rotate', 'بازگشت / مرجوعی'),
    ('lock', 'قفل / امنیت'),
    ('headphones', 'هدفون / پشتیبانی'),
    ('gift', 'هدیه'),
    ('star', 'ستاره'),
    ('award', 'مدال'),
]

PRODUCT_SOURCE_CHOICES = [
    ('new', 'جدیدترین محصولات'),
    ('bestsellers', 'پرفروش‌ترین محصولات'),
    ('featured', 'محصولات ویژه'),
]


# ─── Hero slider ────────────────────────────────────────────────────────────────
class HeroSlideBlock(StructBlock):
    title = CharBlock(label='عنوان')
    subtitle = CharBlock(required=False, label='زیرعنوان')
    badge = CharBlock(required=False, label='برچسب')
    cta_text = CharBlock(required=False, label='متن دکمه')
    cta_link = CharBlock(required=False, label='لینک دکمه', help_text='مثال: /products')
    accent = CharBlock(required=False, default='#b8860b', label='رنگ تأکید (HEX)')


class HeroSliderBlock(StructBlock):
    slides = ListBlock(HeroSlideBlock(), label='اسلایدها')

    class Meta:
        icon = 'image'
        label = 'اسلایدر بنر'


# ─── Trust bar ──────────────────────────────────────────────────────────────────
class TrustItemBlock(StructBlock):
    icon = ChoiceBlock(choices=TRUST_ICON_CHOICES, label='آیکن')
    title = CharBlock(label='عنوان')
    description = CharBlock(required=False, label='توضیح')


class TrustBarBlock(StructBlock):
    items = ListBlock(TrustItemBlock(), label='موارد')

    class Meta:
        icon = 'tick-inverse'
        label = 'نوار اعتماد'


# ─── Categories (data-driven) ───────────────────────────────────────────────────
class CategoriesSectionBlock(StructBlock):
    heading = CharBlock(default='دسته‌بندی محصولات', label='عنوان')
    subheading = CharBlock(required=False, label='زیرعنوان')

    class Meta:
        icon = 'folder-open-inverse'
        label = 'بخش دسته‌بندی‌ها'


# ─── Products section (data-driven) ─────────────────────────────────────────────
class ProductSectionBlock(StructBlock):
    source = ChoiceBlock(choices=PRODUCT_SOURCE_CHOICES, default='new', label='منبع محصولات')
    heading = CharBlock(label='عنوان')
    subheading = CharBlock(required=False, label='زیرعنوان')
    link_text = CharBlock(required=False, default='مشاهده همه', label='متن لینک')
    link_url = CharBlock(required=False, label='لینک', help_text='مثال: /products?ordering=-created_at')

    class Meta:
        icon = 'list-ul'
        label = 'بخش محصولات'


# ─── Special offer banner ───────────────────────────────────────────────────────
class SpecialOfferBlock(StructBlock):
    badge = CharBlock(required=False, label='برچسب')
    title = CharBlock(label='عنوان')
    description = TextBlock(required=False, label='توضیح')
    button_text = CharBlock(required=False, label='متن دکمه')
    button_link = CharBlock(required=False, label='لینک دکمه')

    class Meta:
        icon = 'pick'
        label = 'بنر پیشنهاد ویژه'


# ─── Features ───────────────────────────────────────────────────────────────────
class FeatureItemBlock(StructBlock):
    icon = CharBlock(label='آیکن (اموجی)', help_text='مثال: 🏛️')
    title = CharBlock(label='عنوان')
    description = TextBlock(label='توضیح')


class FeaturesBlock(StructBlock):
    heading = CharBlock(label='عنوان')
    subheading = CharBlock(required=False, label='زیرعنوان')
    items = ListBlock(FeatureItemBlock(), label='ویژگی‌ها')

    class Meta:
        icon = 'cogs'
        label = 'بخش ویژگی‌ها'


# ─── Blog preview (data-driven) ─────────────────────────────────────────────────
class BlogPreviewBlock(StructBlock):
    heading = CharBlock(default='آخرین مطالب', label='عنوان')
    subheading = CharBlock(required=False, label='زیرعنوان')
    link_text = CharBlock(required=False, default='مشاهده همه', label='متن لینک')

    class Meta:
        icon = 'doc-full'
        label = 'پیش‌نمایش وبلاگ'


# ─── Newsletter ─────────────────────────────────────────────────────────────────
class NewsletterBlock(StructBlock):
    title = CharBlock(label='عنوان')
    description = TextBlock(required=False, label='توضیح')
    button_text = CharBlock(required=False, default='عضویت', label='متن دکمه')

    class Meta:
        icon = 'mail'
        label = 'خبرنامه'


# لیست بلاک‌های مجاز در بدنه صفحه اصلی
HOME_BLOCKS = [
    ('hero_slider', HeroSliderBlock()),
    ('trust_bar', TrustBarBlock()),
    ('categories', CategoriesSectionBlock()),
    ('products', ProductSectionBlock()),
    ('special_offer', SpecialOfferBlock()),
    ('features', FeaturesBlock()),
    ('blog_preview', BlogPreviewBlock()),
    ('newsletter', NewsletterBlock()),
]
