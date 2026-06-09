"""
Populate the home page `body` StreamField with the default sections so the
landing page becomes fully editable from the Wagtail admin.

Usage:
    python manage.py seed_homepage          # only if body is empty
    python manage.py seed_homepage --force  # overwrite existing body
"""
from django.core.management.base import BaseCommand

from apps.cms.models import HomePage

DEFAULT_BODY = [
    ('hero_slider', {
        'slides': [
            {
                'title': 'زیورآلات نقره اصیل ایرانی',
                'subtitle': 'با بیش از ۷۰ سال سابقه در عرضه بهترین نقره',
                'badge': 'جدید ۱۴۰۳',
                'cta_text': 'مشاهده مجموعه',
                'cta_link': '/products',
                'accent': '#b8860b',
            },
            {
                'title': 'انگشترهای نقره دست ساز',
                'subtitle': 'طرح‌های منحصربه‌فرد توسط هنرمندان ایرانی',
                'badge': 'ویژه',
                'cta_text': 'خرید انگشتر',
                'cta_link': '/products?category=angoshtar',
                'accent': '#8b6509',
            },
            {
                'title': 'سرویس‌های کامل نقره ۹۲۵',
                'subtitle': 'ست کامل گردنبند، انگشتر و دستبند با ضمانت اصالت',
                'badge': '۲۰٪ تخفیف',
                'cta_text': 'مشاهده سرویس‌ها',
                'cta_link': '/products?category=servis',
                'accent': '#d4a017',
            },
        ],
    }),
    ('trust_bar', {
        'items': [
            {'icon': 'shield', 'title': 'ضمانت اصالت', 'description': 'نقره خالص تضمینی'},
            {'icon': 'truck', 'title': 'ارسال سریع', 'description': 'سراسر ایران'},
            {'icon': 'rotate', 'title': 'مرجوعی ۷ روزه', 'description': 'بدون سوال'},
            {'icon': 'lock', 'title': 'پرداخت امن', 'description': 'درگاه معتبر بانکی'},
            {'icon': 'headphones', 'title': 'پشتیبانی ۲۴/۷', 'description': 'همیشه در کنار شما'},
        ],
    }),
    ('categories', {
        'heading': 'دسته‌بندی محصولات',
        'subheading': 'مجموعه کاملی از زیورآلات نقره اصیل',
    }),
    ('products', {
        'source': 'new',
        'heading': 'جدیدترین محصولات',
        'subheading': 'تازه‌ترین اضافات به مجموعه ما',
        'link_text': 'مشاهده همه',
        'link_url': '/products?ordering=-created_at',
    }),
    ('special_offer', {
        'badge': 'پیشنهاد ویژه',
        'title': 'تخفیف ۲۰٪ روی سرویس‌های کامل',
        'description': 'فقط تا پایان این هفته — ست‌های کامل انگشتر، گردنبند و دستبند نقره ۹۲۵ با قیمت استثنایی',
        'button_text': 'خرید اکنون',
        'button_link': '/products?category=servis',
    }),
    ('products', {
        'source': 'bestsellers',
        'heading': 'پرفروش‌ترین محصولات',
        'subheading': 'محبوب‌ترین انتخاب‌های مشتریان',
        'link_text': 'مشاهده همه',
        'link_url': '/products?ordering=-sales_count',
    }),
    ('features', {
        'heading': 'چرا گوهر ولا؟',
        'subheading': 'ما به کیفیت، صداقت و رضایت مشتریانمان متعهدیم',
        'items': [
            {'icon': '🏛️', 'title': '۷۰ سال سابقه', 'description': 'از سال ۱۳۳۲ در خدمت خانواده‌های ایرانی با بهترین کیفیت و صادقانه‌ترین قیمت.'},
            {'icon': '🔬', 'title': 'آزمایشگاه تست', 'description': 'تمامی محصولات قبل از ارائه در آزمایشگاه معتبر تست عیار می‌شوند.'},
            {'icon': '🎁', 'title': 'بسته‌بندی هدیه', 'description': 'ارائه جعبه هدیه لاکچری رایگان برای تمامی سفارشات.'},
            {'icon': '🔧', 'title': 'تعمیرات نقره', 'description': 'خدمات تعمیر و پولیش حرفه‌ای زیورآلات نقره توسط استادکاران مجرب.'},
        ],
    }),
    ('blog_preview', {
        'heading': 'آخرین مطالب',
        'subheading': 'راهنمایی و اخبار دنیای جواهرات',
        'link_text': 'مشاهده همه',
    }),
    ('newsletter', {
        'title': 'خبرنامه گوهر ولا',
        'description': 'اولین نفری باشید که از تخفیف‌ها و محصولات جدید باخبر می‌شود',
        'button_text': 'عضویت رایگان',
    }),
]


class Command(BaseCommand):
    help = 'پر کردن بخش‌های پیش‌فرض صفحه اصلی برای ویرایش از پنل'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='بازنویسی محتوای موجود body',
        )

    def handle(self, *args, **options):
        home = HomePage.objects.first()
        if home is None:
            self.stderr.write(self.style.ERROR('صفحه اصلی (HomePage) پیدا نشد.'))
            return

        if home.body and not options['force']:
            self.stdout.write(self.style.WARNING(
                'صفحه اصلی از قبل محتوا دارد. برای بازنویسی از --force استفاده کنید.'
            ))
            return

        home.body = DEFAULT_BODY
        rev = home.save_revision()
        rev.publish()
        self.stdout.write(self.style.SUCCESS('بخش‌های صفحه اصلی با موفقیت پر و منتشر شد.'))
