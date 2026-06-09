"""
Django-filter FilterSet for the Product model.
"""
import django_filters
from django.db.models import Q

from .models import Category, Product, StoneType


class ProductFilter(django_filters.FilterSet):
    """
    Filterset for product list endpoint.

    Supported query params:
        ?category=<slug>
        ?stone_type=<slug>
        ?min_price=<int>
        ?max_price=<int>
        ?is_featured=true
        ?status=active
        ?ordering=price|-price|-created_at|-sales_count
        ?search=<text>
    """

    category = django_filters.CharFilter(
        field_name='category__slug',
        lookup_expr='exact',
        label='دسته‌بندی (slug)',
    )
    stone_type = django_filters.CharFilter(
        field_name='stone_type__slug',
        lookup_expr='exact',
        label='نوع سنگ (slug)',
    )
    min_price = django_filters.NumberFilter(
        field_name='price',
        lookup_expr='gte',
        label='حداقل قیمت',
    )
    max_price = django_filters.NumberFilter(
        field_name='price',
        lookup_expr='lte',
        label='حداکثر قیمت',
    )
    is_featured = django_filters.BooleanFilter(
        field_name='is_featured',
        label='ویژه',
    )
    status = django_filters.ChoiceFilter(
        choices=Product.STATUS_CHOICES,
        label='وضعیت',
    )
    silver_grade = django_filters.ChoiceFilter(
        choices=Product.SILVER_GRADE_CHOICES,
        label='عیار نقره',
    )
    ordering = django_filters.OrderingFilter(
        fields=(
            ('price', 'price'),
            ('created_at', 'created_at'),
            ('sales_count', 'sales_count'),
            ('views_count', 'views_count'),
        ),
        field_labels={
            'price': 'قیمت (صعودی)',
            '-price': 'قیمت (نزولی)',
            '-created_at': 'جدیدترین',
            '-sales_count': 'پرفروش‌ترین',
        },
        label='مرتب‌سازی',
    )
    search = django_filters.CharFilter(
        method='filter_search',
        label='جستجو',
    )

    class Meta:
        model = Product
        fields = [
            'category', 'stone_type', 'min_price', 'max_price',
            'is_featured', 'status', 'silver_grade', 'ordering', 'search',
        ]

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(name__icontains=value)
            | Q(description__icontains=value)
            | Q(short_description__icontains=value)
            | Q(sku__icontains=value)
        )
