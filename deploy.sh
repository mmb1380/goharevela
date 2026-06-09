#!/usr/bin/env bash
#
# deploy.sh — استقرار گوهر ولا روی سرور پروداکشن
#
# استفاده:
#   ./deploy.sh            # استقرار برنچ پیش‌فرض
#   BRANCH=main ./deploy.sh  # استقرار یک برنچ دیگر
#
# پیش‌نیاز: روی خود سرور و با کاربری که دسترسی لازم دارد اجرا شود.

set -euo pipefail

# ─── پیکربندی (در صورت نیاز ویرایش کن) ──────────────────────────────────────────
REPO_DIR="${REPO_DIR:-/var/www/goharevela}"
BRANCH="${BRANCH:-claude/clever-carson-r6f0sg}"
FRONTEND_DIR="$REPO_DIR/frontend"
BACKEND_DIR="$REPO_DIR/backend"
FRONTEND_SERVICE="${FRONTEND_SERVICE:-goharevela-frontend}"  # نام سرویس systemd فرانت
BACKEND_SERVICE="${BACKEND_SERVICE:-gunicorn}"               # نام سرویس systemd بک‌اند
VENV_DIR="${VENV_DIR:-$BACKEND_DIR/venv}"
DJANGO_SETTINGS="${DJANGO_SETTINGS:-config.settings.production}"

# ─── ابزار لاگ ─────────────────────────────────────────────────────────────────
log()  { printf '\n\033[1;34m▶ %s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m✔ %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m⚠ %s\033[0m\n' "$*"; }

# ─── ۱) گرفتن آخرین تغییرات ─────────────────────────────────────────────────────
log "گرفتن آخرین تغییرات از برنچ $BRANCH"
cd "$REPO_DIR"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull origin "$BRANCH"
ok "کد به‌روز شد ($(git rev-parse --short HEAD))"

# ─── ۲) بک‌اند ──────────────────────────────────────────────────────────────────
log "استقرار بک‌اند"
cd "$BACKEND_DIR"
if [ -f "$VENV_DIR/bin/activate" ]; then
  # shellcheck disable=SC1091
  source "$VENV_DIR/bin/activate"
else
  warn "virtualenv در $VENV_DIR پیدا نشد — از پایتون سیستمی استفاده می‌شود."
fi

pip install -r requirements.txt
python manage.py migrate --noinput --settings="$DJANGO_SETTINGS"
python manage.py collectstatic --noinput --settings="$DJANGO_SETTINGS"

log "ری‌استارت سرویس بک‌اند ($BACKEND_SERVICE)"
sudo systemctl restart "$BACKEND_SERVICE"
ok "بک‌اند ری‌استارت شد"

# ─── ۳) فرانت‌اند ───────────────────────────────────────────────────────────────
log "استقرار فرانت‌اند"
cd "$FRONTEND_DIR"
npm install
npm run build

log "ری‌استارت فرانت‌اند ($FRONTEND_SERVICE)"
sudo systemctl restart "$FRONTEND_SERVICE"
ok "فرانت‌اند ری‌استارت شد"

# ─── پایان ─────────────────────────────────────────────────────────────────────
ok "استقرار با موفقیت انجام شد."
warn "یادآوری: عنوان برند در صفحه‌ها/اسنیپت‌های Wagtail در دیتابیس ذخیره می‌شود و"
warn "با استقرار کد عوض نمی‌شود. در صورت نیاز از پنل /cms/ آن را دستی ویرایش و Publish کن."
