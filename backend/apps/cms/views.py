"""
Lightweight JSON API for site-wide CMS data (settings + menus) consumed by
the Next.js front-end. Wagtail's page API does not expose snippets/settings,
so this small read-only endpoint fills that gap.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Menu, SiteSettings

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

    return Response({'settings': settings_data, 'menus': menus})
