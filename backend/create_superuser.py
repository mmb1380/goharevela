import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.accounts.models import User

if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        password='admin1234',
        phone='09121234567',
        email='admin@goharevela.ir',
    )
    print('Superuser created: admin / admin1234')
else:
    print('Superuser already exists.')
