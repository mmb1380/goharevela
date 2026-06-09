"""
Admin configuration for the accounts app.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = [
        'username', 'full_name', 'phone', 'email',
        'city', 'is_active', 'is_staff', 'date_joined',
    ]
    list_filter = ['is_active', 'is_staff', 'is_superuser', 'city']
    search_fields = ['username', 'first_name', 'last_name', 'phone', 'email']
    ordering = ['-date_joined']
    readonly_fields = ['date_joined', 'last_login']

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('اطلاعات شخصی'), {
            'fields': ('first_name', 'last_name', 'email', 'phone', 'avatar'),
        }),
        (_('آدرس'), {
            'fields': ('address', 'city', 'postal_code'),
        }),
        (_('دسترسی‌ها'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('تاریخ‌ها'), {
            'fields': ('last_login', 'date_joined'),
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'phone', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )

    def full_name(self, obj):
        return obj.full_name
    full_name.short_description = 'نام کامل'
