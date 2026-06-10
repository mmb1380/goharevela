"""
Lightweight JSON API for site-wide CMS data (settings + menus) consumed by
the Next.js front-end. Wagtail's page API does not expose snippets/settings,
so this small read-only endpoint fills that gap.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Menu, PaymentSettings, ShippingMethod, SiteSettings, SmsSettings

SETTINGS_FIELDS = [
    'brand_name',
    'brand_latin',
    'brand_description',
    'phone_primary',
    'phone_secondary',
    'email',
    'address',
    'working_hours',
    'instagram',
    'telegram',
    'whatsapp',
    'aparat',
    'topbar_message',
]


@api_view(['GET'])
@permission_classes([AllowAny])
def site_config(request):
    """GET /api/site/config/ – تنظیمات سراسری و منوهای سایت."""
    settings_obj = SiteSettings.load(request_or_site=request)
    settings_data = {field: getattr(settings_obj, field, '') for field in SETTINGS_FIELDS}

    menus = {}
    for menu in Menu.objects.prefetch_related('items').all():
        menus[menu.handle] = [
            {
                'label': item.label,
                'link': item.link,
                'open_in_new_tab': item.open_in_new_tab,
            }
            for item in menu.items.all()
        ]

    # تنظیمات پرداخت (فقط اطلاعات لازم برای نمایش — بدون کلید/مرچنت)
    pay = PaymentSettings.load(request_or_site=request)
    payment = {
        'online_enabled': pay.online_enabled,
        'card_to_card_enabled': pay.card_to_card_enabled,
        'card_number': pay.card_number,
        'card_holder': pay.card_holder,
    }

    # روش‌های ارسال فعال
    shipping = [
        {
            'id': sm.id,
            'name': sm.name,
            'description': sm.description,
            'price': str(sm.price),
            'free_above': str(sm.free_above),
            'estimated_days': sm.estimated_days,
        }
        for sm in ShippingMethod.objects.filter(is_enabled=True)
    ]

    # وضعیت پیامک (برای فعال‌سازی ورود/تأیید پیامکی در فرانت)
    sms = SmsSettings.load(request_or_site=request)
    sms_data = {'enabled': sms.enabled}

    return Response({
        'settings': settings_data,
        'menus': menus,
        'payment': payment,
        'shipping': shipping,
        'sms': sms_data,
    })
