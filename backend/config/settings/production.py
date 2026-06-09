import os

from .base import *  # noqa: F401, F403

DEBUG = False

_allowed_raw = os.environ.get('ALLOWED_HOSTS', 'goharevela.ir,www.goharevela.ir')
ALLOWED_HOSTS = [h.strip() for h in _allowed_raw.split(',') if h.strip()] + ['127.0.0.1', 'localhost']

# Static files served by WhiteNoise
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Security headers
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = os.environ.get('SECURE_SSL_REDIRECT', '1') == '1'
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Production email
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'no-reply@goharevela.ir')

# Sentry (optional – install sentry-sdk separately)
# import sentry_sdk
# from sentry_sdk.integrations.django import DjangoIntegration
# SENTRY_DSN = os.environ.get('SENTRY_DSN', '')
# if SENTRY_DSN:
#     sentry_sdk.init(dsn=SENTRY_DSN, integrations=[DjangoIntegration()], traces_sample_rate=0.2)
