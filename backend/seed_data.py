"""
Seed sample data for development.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.products.models import Category, StoneType, Product, Tag

# ── Categories ──────────────────────────────────────────────
cats = [
    {'name': 'انگشتر نقره',   'slug': 'rings',     'icon': '💍', 'order': 1},
    {'name': 'گردنبند نقره',  'slug': 'necklaces', 'icon': '📿', 'order': 2},
    {'name': 'زنجیر نقره',    'slug': 'chains',    'icon': '⛓️', 'order': 3},
    {'name': 'دستبند نقره',   'slug': 'bracelets', 'icon': '🪬', 'order': 4},
    {'name': 'سرویس نقره',    'slug': 'sets',      'icon': '💎', 'order': 5},
    {'name': 'تسبیح',         'slug': 'rosaries',  'icon': '📿', 'order': 6},
    {'name': 'ساعت نقره',     'slug': 'watches',   'icon': '⌚', 'order': 7},
    {'name': 'گوشواره نقره',  'slug': 'earrings',  'icon': '✨', 'order': 8},
]

category_objs = {}
for c in cats:
    obj, created = Category.objects.get_or_create(
        slug=c['slug'],
        defaults={'name': c['name'], 'icon': c['icon'], 'order': c['order'], 'is_active': True}
    )
    category_objs[c['slug']] = obj
    status = "[+] created" if created else "[=] exists"
    print(f"  {status}: {c['slug']}")

# Sub-categories for rings
sub_rings = [
    {'name': 'انگشتر مردانه',  'slug': 'rings-men',      'icon': '💍', 'order': 1},
    {'name': 'انگشتر زنانه',   'slug': 'rings-women',    'icon': '💍', 'order': 2},
    {'name': 'حلقه ازدواج',    'slug': 'rings-wedding',  'icon': '💍', 'order': 3},
    {'name': 'انگشتر بچگانه',  'slug': 'rings-kids',     'icon': '💍', 'order': 4},
]
for c in sub_rings:
    obj, created = Category.objects.get_or_create(
        slug=c['slug'],
        defaults={'name': c['name'], 'icon': c['icon'], 'order': c['order'],
                  'parent': category_objs['rings'], 'is_active': True}
    )
    category_objs[c['slug']] = obj
    status = "[+] created" if created else "[=] exists"
    print(f"  {status}: {c['slug']}")

# ── Stone types ──────────────────────────────────────────────
stones = [
    {'name': 'عقیق یمنی',       'slug': 'agate',      'origin': 'یمن'},
    {'name': 'فیروزه نیشابوری', 'slug': 'turquoise',  'origin': 'نیشابور'},
    {'name': 'یاقوت',           'slug': 'ruby',        'origin': 'برمه'},
    {'name': 'زمرد',            'slug': 'emerald',     'origin': 'کلمبیا'},
    {'name': 'دُر نجف',         'slug': 'dur-najaf',   'origin': 'نجف'},
    {'name': 'کهربا',           'slug': 'amber',       'origin': 'بالتیک'},
    {'name': 'یشم',             'slug': 'jade',        'origin': 'چین'},
    {'name': 'بدون سنگ',        'slug': 'no-stone',    'origin': ''},
]
stone_objs = {}
for s in stones:
    obj, created = StoneType.objects.get_or_create(
        slug=s['slug'],
        defaults={'name': s['name'], 'origin': s['origin']}
    )
    stone_objs[s['slug']] = obj
    status = "[+] created" if created else "[=] exists"
    print(f"  {status}: {s['slug']}")

# ── Tags ────────────────────────────────────────────────────
for t in ['پرفروش', 'جدید', 'تخفیف‌دار', 'ویژه', 'هدیه']:
    Tag.objects.get_or_create(name=t, defaults={'slug': t})

# ── Products ─────────────────────────────────────────────────
products = [
    {
        'name': 'انگشتر نقره مردانه با سنگ عقیق یمنی اصل',
        'slug': 'silver-ring-men-agate',
        'category': 'rings-men',
        'stone_type': 'agate',
        'price': 850000,
        'compare_price': 1200000,
        'stock': 15,
        'silver_grade': '925',
        'weight': '8.5',
        'silver_weight': '7.0',
        'is_featured': True,
        'short_description': 'انگشتر نقره ۹۲۵ با سنگ عقیق یمنی طبیعی، مناسب برای آقایان',
        'description': 'این انگشتر با نقره ۹۲۵ عیار ساخته شده و سنگ عقیق یمنی آن ۱۰۰٪ طبیعی است. دارای گواهی اصالت.',
    },
    {
        'name': 'تسبیح نقره با سنگ فیروزه نیشابوری',
        'slug': 'rosary-turquoise',
        'category': 'rosaries',
        'stone_type': 'turquoise',
        'price': 1200000,
        'compare_price': 1500000,
        'stock': 8,
        'silver_grade': '925',
        'weight': '45.0',
        'silver_weight': '12.0',
        'is_featured': True,
        'short_description': 'تسبیح ۳۳ دانه فیروزه نیشابوری با جداکننده نقره',
        'description': 'تسبیح ۳۳ دانه از فیروزه نیشابوری اصل با جداکننده و گلوبند نقره ۹۲۵. هر دانه به‌صورت دستی پرداخت شده.',
    },
    {
        'name': 'گردنبند نقره زنانه طرح گل با سنگ زمرد',
        'slug': 'necklace-women-emerald',
        'category': 'necklaces',
        'stone_type': 'emerald',
        'price': 650000,
        'compare_price': None,
        'stock': 20,
        'silver_grade': '925',
        'weight': '5.2',
        'silver_weight': '4.8',
        'is_featured': True,
        'short_description': 'گردنبند ظریف زنانه با آویز گل و سنگ زمرد',
        'description': 'گردنبند ظریف با آویز طرح گل رز و سنگ زمرد طبیعی. زنجیر ۴۵ سانتی‌متری از نقره ۹۲۵.',
    },
    {
        'name': 'ساعت مچی نقره مردانه صفحه مشکی',
        'slug': 'watch-men-black',
        'category': 'watches',
        'stone_type': None,
        'price': 3800000,
        'compare_price': 4500000,
        'stock': 5,
        'silver_grade': '925',
        'weight': '85.0',
        'silver_weight': '60.0',
        'is_featured': False,
        'short_description': 'ساعت مچی با بدنه نقره ۹۲۵ و صفحه مشکی کلاسیک',
        'description': 'ساعت مچی لوکس با بدنه کامل نقره ۹۲۵، صفحه مشکی، عقربه‌های طلایی و بند چرمی ایتالیایی.',
    },
    {
        'name': 'سرویس کامل نقره زنانه با سنگ دُر نجف',
        'slug': 'set-women-dur-najaf',
        'category': 'sets',
        'stone_type': 'dur-najaf',
        'price': 5500000,
        'compare_price': None,
        'stock': 3,
        'silver_grade': '925',
        'weight': '38.0',
        'silver_weight': '35.0',
        'is_featured': True,
        'short_description': 'سرویس کامل شامل انگشتر، گردنبند، دستبند و گوشواره',
        'description': 'سرویس کامل زنانه با سنگ دُر نجف اصل. شامل انگشتر، گردنبند، دستبند و گوشواره با جعبه هدیه شیک.',
    },
    {
        'name': 'دستبند نقره زنانه با آویز چشم نظر',
        'slug': 'bracelet-women-evil-eye',
        'category': 'bracelets',
        'stone_type': None,
        'price': 480000,
        'compare_price': 580000,
        'stock': 25,
        'silver_grade': '835',
        'weight': '6.5',
        'silver_weight': '5.5',
        'is_featured': False,
        'short_description': 'دستبند ظریف زنانه با آویز چشم نظر آبی',
        'description': 'دستبند ظریف نقره با آویز چشم نظر فیروزه‌ای. قابل تنظیم از ۱۶ تا ۱۹ سانتی‌متر.',
    },
    {
        'name': 'انگشتر نقره زنانه طرح گل رز یاقوت',
        'slug': 'ring-women-ruby',
        'category': 'rings-women',
        'stone_type': 'ruby',
        'price': 720000,
        'compare_price': None,
        'stock': 12,
        'silver_grade': '925',
        'weight': '4.8',
        'silver_weight': '4.2',
        'is_featured': True,
        'short_description': 'انگشتر ظریف زنانه با سنگ یاقوت و طرح گل رز',
        'description': 'انگشتر زنانه با طرح گل رز繊細 و سنگ یاقوت طبیعی. موجود در سایزهای ۶ تا ۱۲.',
    },
    {
        'name': 'تسبیح عقیق ۳۳ دانه با نگین نقره',
        'slug': 'rosary-agate-33',
        'category': 'rosaries',
        'stone_type': 'agate',
        'price': 420000,
        'compare_price': 500000,
        'stock': 30,
        'silver_grade': '925',
        'weight': '32.0',
        'silver_weight': '8.0',
        'is_featured': False,
        'short_description': 'تسبیح ۳۳ دانه عقیق با جداکننده نقره',
        'description': 'تسبیح ۳۳ دانه از عقیق یمنی اصل با جداکننده‌های نقره ۹۲۵ و گلوبند طلایی.',
    },
    {
        'name': 'زنجیر نقره مردانه ۵۰ سانتی کوبلاست',
        'slug': 'chain-men-cuban-50',
        'category': 'chains',
        'stone_type': None,
        'price': 980000,
        'compare_price': None,
        'stock': 10,
        'silver_grade': '925',
        'weight': '22.0',
        'silver_weight': '22.0',
        'is_featured': False,
        'short_description': 'زنجیر کوبلاست ۵۰ سانتی با عرض ۶ میلی‌متر',
        'description': 'زنجیر کوبلاست (Cuban Link) از نقره ۹۲۵ عیار. طول ۵۰ سانتی‌متر، عرض ۶ میلی‌متر، مناسب برای آقایان.',
    },
    {
        'name': 'گوشواره نقره زنانه آویز یاقوت',
        'slug': 'earrings-women-ruby',
        'category': 'earrings',
        'stone_type': 'ruby',
        'price': 350000,
        'compare_price': 420000,
        'stock': 18,
        'silver_grade': '925',
        'weight': '3.2',
        'silver_weight': '2.8',
        'is_featured': False,
        'short_description': 'گوشواره آویز زنانه با سنگ یاقوت طبیعی',
        'description': 'گوشواره آویز ظریف با پایه استیک و آویز سنگ یاقوت طبیعی. سبک و مناسب استفاده روزانه.',
    },
    {
        'name': 'انگشتر نقره مردانه دُر نجف شفاف',
        'slug': 'ring-men-dur-najaf',
        'category': 'rings-men',
        'stone_type': 'dur-najaf',
        'price': 960000,
        'compare_price': None,
        'stock': 7,
        'silver_grade': '925',
        'weight': '9.1',
        'silver_weight': '8.0',
        'is_featured': True,
        'short_description': 'انگشتر مردانه با سنگ دُر نجف شفاف طبیعی',
        'description': 'انگشتر مردانه با سنگ دُر نجف شفاف اصل از نجف اشرف. بدنه نقره ۹۲۵ با تراش دستی.',
    },
    {
        'name': 'دستبند نقره مردانه زنجیری کلاسیک',
        'slug': 'bracelet-men-chain',
        'category': 'bracelets',
        'stone_type': None,
        'price': 560000,
        'compare_price': 650000,
        'stock': 14,
        'silver_grade': '925',
        'weight': '18.0',
        'silver_weight': '18.0',
        'is_featured': False,
        'short_description': 'دستبند زنجیری مردانه نقره ۹۲۵ سایز ۲۱ سانتی',
        'description': 'دستبند زنجیری کلاسیک برای آقایان. طول ۲۱ سانتی‌متر، قفل کارابین محکم، نقره ۹۲۵ عیار.',
    },
]

for p in products:
    cat = category_objs.get(p['category'])
    stone = stone_objs.get(p['stone_type']) if p['stone_type'] else None

    obj, created = Product.objects.get_or_create(
        slug=p['slug'],
        defaults={
            'name': p['name'],
            'category': cat,
            'stone_type': stone,
            'price': p['price'],
            'compare_price': p['compare_price'],
            'stock': p['stock'],
            'silver_grade': p['silver_grade'],
            'weight': p['weight'],
            'silver_weight': p['silver_weight'],
            'is_featured': p['is_featured'],
            'short_description': p['short_description'],
            'description': p['description'],
            'status': 'active',
        }
    )
    status = "[+] created" if created else "[=] exists"
    print(f"  {status}: {p['slug']}")

print(f"\nDone! {Product.objects.count()} products, {Category.objects.count()} categories, {StoneType.objects.count()} stones.")
