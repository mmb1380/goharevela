"""
Admin configuration for the products app.
"""
from django.contrib import admin
from django.utils.html import format_html

from .models import Category, Product, ProductImage, ProductReview, StoneType, Tag


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'icon', 'is_active', 'order', 'product_count']
    list_filter = ['is_active', 'parent']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['is_active', 'order']
    ordering = ['order', 'name']

    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'تعداد محصولات'


@admin.register(StoneType)
class StoneTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'origin', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['is_active']


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ['image', 'alt_text', 'is_primary', 'order', 'image_preview']
    readonly_fields = ['image_preview']

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:60px;"/>', obj.image.url)
        return '—'
    image_preview.short_description = 'پیش‌نمایش'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'sku', 'category', 'stone_type',
        'price', 'stock', 'status', 'is_featured',
        'sales_count', 'views_count', 'created_at',
    ]
    list_filter = [
        'status', 'is_featured', 'category',
        'stone_type', 'silver_grade', 'created_at',
    ]
    search_fields = ['name', 'sku', 'description']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['views_count', 'sales_count', 'created_at', 'updated_at']
    filter_horizontal = ['tags']
    inlines = [ProductImageInline]
    list_editable = ['price', 'stock', 'status', 'is_featured']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    save_on_top = True

    fieldsets = (
        ('اطلاعات اصلی', {
            'fields': ('name', 'slug', 'category', 'stone_type', 'tags', 'status', 'is_featured'),
        }),
        ('توضیحات', {
            'fields': ('short_description', 'description'),
        }),
        ('قیمت‌گذاری', {
            'fields': ('price', 'compare_price', 'cost_price'),
        }),
        ('مشخصات فیزیکی', {
            'fields': ('sku', 'weight', 'silver_weight', 'silver_grade', 'stock'),
        }),
        ('سئو', {
            'classes': ('collapse',),
            'fields': ('meta_title', 'meta_description'),
        }),
        ('آمار', {
            'classes': ('collapse',),
            'fields': ('views_count', 'sales_count', 'created_at', 'updated_at'),
        }),
    )


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating', 'title', 'is_approved', 'created_at']
    list_filter = ['is_approved', 'rating', 'created_at']
    search_fields = ['product__name', 'user__username', 'title', 'body']
    list_editable = ['is_approved']
    actions = ['approve_reviews', 'reject_reviews']
    readonly_fields = ['created_at']

    def approve_reviews(self, request, queryset):
        updated = queryset.update(is_approved=True)
        self.message_user(request, f'{updated} نظر تأیید شد.')
    approve_reviews.short_description = 'تأیید نظرات انتخاب‌شده'

    def reject_reviews(self, request, queryset):
        updated = queryset.update(is_approved=False)
        self.message_user(request, f'{updated} نظر رد شد.')
    reject_reviews.short_description = 'رد نظرات انتخاب‌شده'
