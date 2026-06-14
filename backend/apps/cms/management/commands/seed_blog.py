"""
ساخت فهرست مقالات (BlogIndexPage) زیر صفحه اصلی و چند مقاله نمونه، تا صفحه
وبلاگ خالی نباشد و مدیر بتواند از پنل آن‌ها را ویرایش کند.

Usage:
    python manage.py seed_blog
    python manage.py seed_blog --force   # بازنویسی مقالات نمونه
"""
from datetime import date

from django.core.management.base import BaseCommand
from django.db import transaction
from wagtail.models import Page, Site

from apps.cms.models import BlogIndexPage, BlogPage

SAMPLE_POSTS = [
    {
        'title': 'راهنمای نگهداری زیورآلات نقره',
        'slug': 'care-guide',
        'intro': 'برای حفظ زیبایی و درخشش زیورآلات نقره خود چند نکته ساده اما مهم را بدانید.',
        'date': date(2024, 6, 4),
        'body': [
            {'type': 'paragraph', 'value': '<p>نقره فلزی زنده است و در اثر تماس با هوا و رطوبت به‌مرور تیره می‌شود. با رعایت چند نکته می‌توانید درخشش آن را حفظ کنید.</p>'},
            {'type': 'heading', 'value': 'نگهداری صحیح'},
            {'type': 'paragraph', 'value': '<p>زیورآلات را در کیسه‌های زیپ‌دار و دور از رطوبت نگهداری کنید. هنگام استحمام یا شنا آن‌ها را درآورید.</p>'},
        ],
    },
    {
        'title': 'تفاوت نقره ۹۲۵ و ۹۹۹',
        'slug': 'silver-grades',
        'intro': 'آشنایی با انواع عیار نقره و تفاوت‌های کاربردی آن‌ها در ساخت زیورآلات.',
        'date': date(2024, 5, 28),
        'body': [
            {'type': 'paragraph', 'value': '<p>نقره ۹۲۵ یعنی ۹۲٫۵٪ نقره خالص و مابقی مس، که استحکام مناسبی برای زیورآلات ایجاد می‌کند. نقره ۹۹۹ خالص‌تر اما نرم‌تر است.</p>'},
        ],
    },
    {
        'title': 'ترندهای جواهرات نقره در سال ۱۴۰۳',
        'slug': 'trends-1403',
        'intro': 'جدیدترین مدل‌ها و طرح‌های زیورآلات نقره که امسال محبوب شده‌اند.',
        'date': date(2024, 5, 14),
        'body': [
            {'type': 'paragraph', 'value': '<p>امسال طرح‌های مینیمال و دستبندهای ظریف و همچنین انگشترهای سنگ‌دار طبیعی بیشترین استقبال را داشته‌اند.</p>'},
        ],
    },
]


class Command(BaseCommand):
    help = 'ساخت فهرست مقالات و چند مقاله نمونه'

    def add_arguments(self, parser):
        parser.add_argument('--force', action='store_true', help='بازنویسی مقالات نمونه')

    @transaction.atomic
    def handle(self, *args, **options):
        force = options['force']

        site = Site.objects.filter(is_default_site=True).first() or Site.objects.first()
        if site is None:
            self.stderr.write(self.style.ERROR('هیچ Site ای پیدا نشد.'))
            return

        root = site.root_page.specific

        # ─── فهرست مقالات ───
        index = BlogIndexPage.objects.first()
        if index is None:
            index = BlogIndexPage(title='وبلاگ', slug='blog', intro='آخرین مطالب و راهنمای دنیای جواهرات')
            root.add_child(instance=index)
            index.save_revision().publish()
            self.stdout.write(self.style.SUCCESS(f'فهرست مقالات ساخته شد (id={index.id}).'))
        else:
            self.stdout.write('فهرست مقالات از قبل وجود دارد.')

        # ─── مقالات نمونه ───
        created = 0
        for data in SAMPLE_POSTS:
            existing = BlogPage.objects.filter(slug=data['slug']).first()
            if existing:
                if force:
                    existing.title = data['title']
                    existing.intro = data['intro']
                    existing.date = data['date']
                    existing.body = data['body']
                    existing.save_revision().publish()
                    self.stdout.write(f'مقاله «{data["title"]}» بروزرسانی شد.')
                continue
            post = BlogPage(
                title=data['title'],
                slug=data['slug'],
                intro=data['intro'],
                date=data['date'],
                body=data['body'],
            )
            index.add_child(instance=post)
            post.save_revision().publish()
            created += 1

        if created:
            self.stdout.write(self.style.SUCCESS(f'{created} مقاله نمونه ساخته شد.'))
        self.stdout.write(self.style.SUCCESS('انجام شد.'))
