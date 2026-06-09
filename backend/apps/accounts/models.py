"""
Custom User model for حجره شوشتری.
"""
import re

from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models


def validate_iranian_phone(value: str) -> None:
    """Validate Iranian mobile phone numbers (09xxxxxxxxx)."""
    pattern = re.compile(r'^09[0-9]{9}$')
    if not pattern.match(value):
        raise ValidationError(
            'شماره موبایل معتبر نیست. فرمت صحیح: 09xxxxxxxxx',
            code='invalid_phone',
        )


class User(AbstractUser):
    """
    Extended user model with Iranian-specific fields.
    Username is still used for admin login; phone is the primary
    customer identifier.
    """
    phone = models.CharField(
        max_length=11,
        unique=True,
        validators=[validate_iranian_phone],
        verbose_name='شماره موبایل',
        help_text='فرمت: 09xxxxxxxxx',
    )
    address = models.TextField(
        blank=True,
        verbose_name='آدرس',
    )
    city = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='شهر',
    )
    postal_code = models.CharField(
        max_length=10,
        blank=True,
        verbose_name='کد پستی',
    )
    avatar = models.ImageField(
        upload_to='avatars/',
        blank=True,
        null=True,
        verbose_name='تصویر پروفایل',
    )

    REQUIRED_FIELDS = ['phone', 'email']

    class Meta:
        verbose_name = 'کاربر'
        verbose_name_plural = 'کاربران'
        ordering = ['-date_joined']

    def __str__(self) -> str:
        return self.get_full_name() or self.username

    @property
    def full_name(self) -> str:
        return self.get_full_name() or self.username
