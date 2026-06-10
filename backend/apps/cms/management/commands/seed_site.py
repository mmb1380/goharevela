"""
Populate site settings and menus with the current (previously hard-coded)
content so the header, footer and navigation become editable from the admin.

Usage:
    python manage.py seed_site
    python manage.py seed_site --force   # overwrite existing settings/menus
"""
from django.core.management.base import BaseCommand

from apps.cms.models import Menu, MenuItem, SiteSettings
from apps.products.models import Category

DEFAULT_SETTINGS = {
    'brand_name': 'گوهر ولا',
    'brand_latin': 'GOHAREVELA',
    'brand_description': 'گوهر ولا با سال‌ها سابقه درخشان در عرضه زیورآلات نقره اصیل ایرانی، افتخار دارد بهترین محصولات را با ضمانت اصالت به شما عرضه نماید.',
    'phone_primary': '۰۲۱-۸۸۰۰۱۲۳۴',
    'phone_secondary': '۰۹۱۲-۰۰۰۱۲۳۴',
    'email': 'info@goharevela.ir',
    'address': 'تهران، بازار طلا و جواهر، گوهر ولا',
    'working_hours': 'شنبه تا پنج‌شنبه ۹ تا ۱۸',
    'instagram': 'https://instagram.com/goharevela',
    'telegram': 'https://t.me/goharevela',
    'whatsapp': 'https://wa.me/989120001234',
    'aparat': 'https://aparat.com/goharevela',
    'topbar_message': 'ارسال رایگان برای خریدهای بالای ۵۰۰ هزار تومان',
}

FOOTER_QUICK = [
    ('درباره ما', '/about'),
    ('محصولات', '/products'),
    ('وبلاگ', '/blog'),
    ('تماس با ما', '/contact'),
    ('سوالات متداول', '/faq'),
    ('قوانین و مقررات', '/terms'),
    ('حریم خصوصی', '/privacy'),
    ('راهنمای خرید', '/guide'),
]

FOOTER_BOTTOM = [
    ('قوانین', '/terms'),
    ('حریم خصوصی', '/privacy'),
    ('نقشه سایت', '/sitemap'),
]


class Command(BaseCommand):
    help = 'پر کردن تنظیمات سایت و منوها با محتوای فعلی'

    def add_arguments(self, parser):
        parser.add_argument('--force', action='store_true', help='بازنویسی محتوای موجود')

    def handle(self, *args, **options):
        force = options['force']

        # ─── تنظیمات سایت ───
        settings_obj = SiteSettings.load()
        if not settings_obj.brand_description or force:
            for field, value in DEFAULT_SETTINGS.items():
                setattr(settings_obj, field, value)
            settings_obj.save()
            self.stdout.write(self.style.SUCCESS('تنظیمات سایت ذخیره شد.'))
        else:
            self.stdout.write('تنظیمات سایت از قبل پر است (برای بازنویسی --force).')

        # ─── منوی اصلی (از روی دسته‌بندی‌های واقعی) ───
        top_categories = Category.objects.filter(
            is_active=True, parent__isnull=True
        ).order_by('order', 'name')
        main_items = [('خانه', '/')]
        main_items += [(c.name, f'/products?category={c.slug}') for c in top_categories]
        main_items += [('وبلاگ', '/blog'), ('تماس با ما', '/contact')]

        self._seed_menu('main', 'منوی اصلی', main_items, force)
        self._seed_menu('footer_quick', 'دسترسی سریع', FOOTER_QUICK, force)
        self._seed_menu('footer_bottom', 'لینک‌های پایین', FOOTER_BOTTOM, force)

        self.stdout.write(self.style.SUCCESS('انجام شد.'))

    def _seed_menu(self, handle, title, items, force):
        menu, created = Menu.objects.get_or_create(handle=handle, defaults={'title': title})
        if not created and menu.items.exists() and not force:
            self.stdout.write(f'منوی «{title}» از قبل آیتم دارد؛ رد شد.')
            return
        menu.items.all().delete()
        for order, (label, link) in enumerate(items):
            MenuItem.objects.create(menu=menu, label=label, link=link, sort_order=order)
        self.stdout.write(self.style.SUCCESS(f'منوی «{title}» با {len(items)} آیتم پر شد.'))
