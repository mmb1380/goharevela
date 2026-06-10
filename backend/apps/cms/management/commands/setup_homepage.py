"""
Ensure a `HomePage` exists and is the root of the default site, migrating any
existing top-level pages (e.g. the blog) underneath it, then populate the
default home-page sections.

This is needed when the site was created with the default Wagtail welcome
page (a plain ``Page``) as its root instead of a ``HomePage``.

Usage:
    python manage.py setup_homepage
    python manage.py setup_homepage --keep-old   # do not delete the old root page
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from wagtail.models import Page, Site

from apps.cms.models import HomePage

from .seed_homepage import DEFAULT_BODY


class Command(BaseCommand):
    help = 'ساخت صفحه اصلی، تنظیم آن به‌عنوان root سایت و پر کردن بخش‌ها'

    def add_arguments(self, parser):
        parser.add_argument(
            '--keep-old',
            action='store_true',
            help='صفحه root قدیمی را حذف نکن',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        site = Site.objects.filter(is_default_site=True).first() or Site.objects.first()
        if site is None:
            self.stderr.write(self.style.ERROR('هیچ Site ای پیدا نشد.'))
            return

        old_root = site.root_page.specific

        if isinstance(old_root, HomePage):
            home = old_root
            self.stdout.write('صفحه اصلی از قبل root سایت است؛ فقط بخش‌ها بررسی می‌شود.')
        else:
            tree_root = Page.objects.get(depth=1)
            home = HomePage(title='صفحه اصلی', slug='home-gohar', hero_title='گوهر ولا')
            tree_root.add_child(instance=home)
            home.save_revision().publish()
            self.stdout.write(self.style.SUCCESS(f'صفحه اصلی ساخته شد (id={home.id}).'))

            # انتقال فرزندان root قدیمی (مثل وبلاگ) به زیر صفحه اصلی
            moved = 0
            for child in list(old_root.get_children()):
                child.move(home, pos='last-child')
                moved += 1
            if moved:
                self.stdout.write(f'{moved} صفحه به زیر صفحه اصلی منتقل شد.')

            # تنظیم صفحه اصلی به‌عنوان root سایت
            site.root_page = home
            site.save()
            self.stdout.write('root سایت روی صفحه اصلی تنظیم شد.')

            # حذف صفحه پیش‌فرض قدیمی (در صورت خالی بودن)
            old_root.refresh_from_db()
            if not options['keep_old'] and old_root.get_children().count() == 0:
                title = old_root.title
                old_root.delete()
                self.stdout.write(f'صفحه قدیمی «{title}» حذف شد.')

        # پر کردن بخش‌ها در صورت خالی بودن
        home.refresh_from_db()
        if not home.body:
            home.body = DEFAULT_BODY
            home.save_revision().publish()
            self.stdout.write(self.style.SUCCESS('بخش‌های صفحه اصلی پر و منتشر شد.'))
        else:
            self.stdout.write('صفحه اصلی از قبل بخش دارد؛ دست‌نخورده ماند.')

        self.stdout.write(self.style.SUCCESS('انجام شد.'))
