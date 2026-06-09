"""
Admin configuration for the orders app.
"""
from django.contrib import admin
from django.utils import timezone

from .models import Cart, CartItem, Coupon, Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'product_name', 'product_sku', 'price', 'quantity', 'subtotal_display']
    fields = ['product', 'product_name', 'product_sku', 'price', 'quantity', 'subtotal_display']
    can_delete = False

    def subtotal_display(self, obj):
        return f'{obj.subtotal:,} تومان'
    subtotal_display.short_description = 'جمع'


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'order_number', 'full_name', 'phone', 'city',
        'total_display', 'status', 'payment_method', 'created_at',
    ]
    list_filter = ['status', 'payment_method', 'city', 'created_at']
    search_fields = [
        'order_number', 'full_name', 'phone', 'email',
        'transaction_id',
    ]
    readonly_fields = [
        'order_number', 'created_at', 'updated_at', 'paid_at',
        'subtotal', 'total',
    ]
    inlines = [OrderItemInline]
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    save_on_top = True
    actions = ['mark_as_processing', 'mark_as_shipped', 'mark_as_delivered']

    fieldsets = (
        ('اطلاعات سفارش', {
            'fields': ('order_number', 'user', 'status', 'notes'),
        }),
        ('اطلاعات مشتری', {
            'fields': ('full_name', 'phone', 'email', 'address', 'city', 'postal_code'),
        }),
        ('مالی', {
            'fields': ('subtotal', 'shipping_cost', 'discount_amount', 'total', 'coupon'),
        }),
        ('پرداخت', {
            'fields': ('payment_method', 'transaction_id', 'paid_at'),
        }),
        ('تاریخ‌ها', {
            'fields': ('created_at', 'updated_at'),
        }),
    )

    def total_display(self, obj):
        return f'{obj.total:,} تومان'
    total_display.short_description = 'مبلغ کل'

    def mark_as_processing(self, request, queryset):
        updated = queryset.update(status='processing')
        self.message_user(request, f'{updated} سفارش به «در حال آماده‌سازی» تغییر وضعیت داد.')
    mark_as_processing.short_description = 'تغییر به: در حال آماده‌سازی'

    def mark_as_shipped(self, request, queryset):
        updated = queryset.update(status='shipped')
        self.message_user(request, f'{updated} سفارش به «ارسال شده» تغییر وضعیت داد.')
    mark_as_shipped.short_description = 'تغییر به: ارسال شده'

    def mark_as_delivered(self, request, queryset):
        updated = queryset.update(status='delivered')
        self.message_user(request, f'{updated} سفارش به «تحویل داده شده» تغییر وضعیت داد.')
    mark_as_delivered.short_description = 'تغییر به: تحویل داده شده'


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = [
        'code', 'discount_type', 'discount_value',
        'min_order_amount', 'used_count', 'max_uses',
        'is_active', 'expires_at',
    ]
    list_filter = ['discount_type', 'is_active']
    search_fields = ['code']
    list_editable = ['is_active']
    readonly_fields = ['used_count', 'created_at']


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ['subtotal_display']

    def subtotal_display(self, obj):
        return f'{obj.subtotal:,} تومان'
    subtotal_display.short_description = 'جمع'


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'session_key', 'item_count_display', 'total_display', 'updated_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'session_key']
    inlines = [CartItemInline]
    readonly_fields = ['created_at', 'updated_at']

    def item_count_display(self, obj):
        return obj.item_count
    item_count_display.short_description = 'تعداد آیتم'

    def total_display(self, obj):
        return f'{obj.total:,} تومان'
    total_display.short_description = 'جمع کل'
