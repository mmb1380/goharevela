from .base import *  # noqa: F401, F403

DEBUG = True
ALLOWED_HOSTS = ['*']

# Use local memory cache (no Redis needed in dev)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

# Use database sessions (no Redis needed)
SESSION_ENGINE = 'django.contrib.sessions.backends.db'

# Use sqlite by default in development if no DATABASE_URL is set
# (base.py already handles this via dj_database_url fallback)

# Show emails in console
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Allow all origins in development (echo back specific origin for credential support)
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# Django Debug Toolbar (optional – install separately if needed)
# INSTALLED_APPS += ['debug_toolbar']
# MIDDLEWARE = ['debug_toolbar.middleware.DebugToolbarMiddleware'] + MIDDLEWARE
# INTERNAL_IPS = ['127.0.0.1']
