# گوهر ولا (Goharevela)

فروشگاه آنلاین جواهرات نقره. بک‌اند Django + Wagtail، فرانت‌اند Next.js 14.

## استقرار (Deployment)

> ⚠️ **مهم:** پروداکشن کاملاً با **systemd** اجرا می‌شود، **نه Docker و نه PM2**.
> فایل‌های `Dockerfile` و `frontend/ecosystem.config.js` در استقرار واقعی استفاده **نمی‌شوند**.

- **سرور:** VPS، مسیر ریپو `/var/www/goharevela` (دامنه `goharevela.ir`)
- **اسکریپت استقرار:** `./deploy.sh` (روی خود سرور اجرا می‌شود)
- **فرانت‌اند:** با **systemd** اجرا می‌شود
  - سرویس: `goharevela-frontend` (در صورت تفاوت: `FRONTEND_SERVICE=نام ./deploy.sh`)
  - دستور: `npm run build` سپس `sudo systemctl restart goharevela-frontend`
  - حالت `next start` است (نه dev) — پس هر تغییر فرانت نیاز به **build مجدد** دارد.
- **بک‌اند:** با **systemd** اجرا می‌شود
  - سرویس: `gunicorn` (در صورت تفاوت: `BACKEND_SERVICE=نام ./deploy.sh`)
  - تنظیمات: `config.settings.production`
  - دستور: `migrate` + `collectstatic` سپس `sudo systemctl restart gunicorn`

## نکات مهم

- **دیتابیس، `.env` و `media/`** فقط روی سرور هستند و در `.gitignore` قرار دارند —
  هیچ‌وقت در git کامیت نشوند (دیتابیس واقعی نباید overwrite شود).
- **اسم برند در دیتابیس:** عنوان بنر صفحه اصلی و اسم Site در Wagtail داخل دیتابیس
  ذخیره می‌شوند و با استقرار کد عوض **نمی‌شوند**؛ در صورت نیاز دستی از پنل `/cms/` ویرایش شوند.
- `WAGTAIL_SITE_NAME` در `backend/config/settings/base.py` تعریف شده (تنظیمات کد، نه دیتابیس).
