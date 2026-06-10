"""
Populate default commerce settings: card-to-card payment details and a
default shipping method, so the store works out of the box and these become
editable from the admin panel (بدون نیاز به کد).

Usage:
    python manage.py seed_commerce
    python manage.py seed_commerce --force   # overwrite existing values
"""
from decimal import Decimal

from django.core.management.base import BaseCommand

from apps.cms.models import PaymentSettings, ShippingMethod

DEFAULT_CARD_NUMBER = '6037-9970-1234-5678'
DEFAULT_CARD_HOLDER = 'علی اصغر کیانی'

DEFAULT_SHIPPING = [
    {
        'name': 'پست پیشتاز',
        'description': 'ارسال سراسری از طریق پست',
        'price': Decimal('40000'),
        'free_above': Decimal('500000'),
        'estimated_days': '۳ تا ۵ روز کاری',
        'sort_order': 0,
    },
    {
        'name': 'تیپاکس',
        'description': 'ارسال سریع درب منزل',
        'price': Decimal('60000'),
        'free_above': Decimal('0'),
        'estimated_days': '۱ تا ۳ روز کاری',
        'sort_order': 1,
    },
]


class Command(BaseCommand):
    help = 'پر کردن تنظیمات پیش‌فرض پرداخت و ارسال'

    def add_arguments(self, parser):
        parser.add_argument('--force', action='store_true', help='بازنویسی مقادیر موجود')

    def handle(self, *args, **options):
        force = options['force']

        # ─── پرداخت (کارت به کارت) ───
        pay = PaymentSettings.load()
        if not pay.card_number or force:
            pay.card_to_card_enabled = True
            pay.card_number = DEFAULT_CARD_NUMBER
            pay.card_holder = DEFAULT_CARD_HOLDER
            pay.save()
            self.stdout.write(self.style.SUCCESS('تنظیمات کارت به کارت ذخیره شد.'))
        else:
            self.stdout.write('تنظیمات پرداخت از قبل پر است (برای بازنویسی --force).')

        # ─── روش‌های ارسال ───
        if ShippingMethod.objects.exists() and not force:
            self.stdout.write('روش‌های ارسال از قبل وجود دارند؛ رد شد.')
        else:
            if force:
                ShippingMethod.objects.all().delete()
            for data in DEFAULT_SHIPPING:
                ShippingMethod.objects.create(**data)
            self.stdout.write(
                self.style.SUCCESS(f'{len(DEFAULT_SHIPPING)} روش ارسال ایجاد شد.')
            )

        self.stdout.write(self.style.SUCCESS('انجام شد.'))
