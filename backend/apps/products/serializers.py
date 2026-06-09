"""
Serializers for the products app.
"""
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Category, Product, ProductImage, ProductReview, StoneType, Tag

User = get_user_model()


class RecursiveCategorySerializer(serializers.Serializer):
    """Helper serializer for recursive children."""

    def to_representation(self, instance):
        serializer = CategorySerializer(instance, context=self.context)
        return serializer.data


class CategorySerializer(serializers.ModelSerializer):
    children = RecursiveCategorySerializer(many=True, read_only=True)
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'parent', 'icon', 'image',
            'description', 'is_active', 'order', 'children', 'product_count',
        ]

    def get_product_count(self, obj):
        return obj.products.filter(status='active').count()


class CategoryFlatSerializer(serializers.ModelSerializer):
    """Lightweight category representation (no children)."""

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon', 'image']


class StoneTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoneType
        fields = ['id', 'name', 'slug', 'description', 'origin', 'image']


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'order']


class ReviewUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'full_name', 'avatar']

    def get_full_name(self, obj):
        return obj.full_name


class ProductReviewSerializer(serializers.ModelSerializer):
    user = ReviewUserSerializer(read_only=True)

    class Meta:
        model = ProductReview
        fields = ['id', 'user', 'rating', 'title', 'body', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class ProductReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductReview
        fields = ['rating', 'title', 'body']

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError('امتیاز باید بین ۱ تا ۵ باشد.')
        return value


# ---------------------------------------------------------------------------
# Product serializers
# ---------------------------------------------------------------------------

class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product list endpoints."""

    category = CategoryFlatSerializer(read_only=True)
    stone_type = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    discount_percent = serializers.IntegerField(read_only=True)
    average_rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()
    is_available = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug',
            'price', 'compare_price', 'discount_percent',
            'category',
            'stone_type',
            'primary_image',
            'average_rating', 'reviews_count',
            'stock', 'is_available', 'is_featured',
            'status', 'sales_count',
            'created_at',
        ]

    def get_stone_type(self, obj):
        if obj.stone_type:
            return {'id': obj.stone_type.id, 'name': obj.stone_type.name}
        return None

    def get_primary_image(self, obj):
        img = obj.get_primary_image()
        if img:
            request = self.context.get('request')
            url = img.image.url
            return request.build_absolute_uri(url) if request else url
        return None

    def get_average_rating(self, obj):
        return obj.average_rating()

    def get_reviews_count(self, obj):
        return obj.reviews.filter(is_approved=True).count()


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full serializer for product detail endpoint."""

    category = CategoryFlatSerializer(read_only=True)
    stone_type = StoneTypeSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = serializers.SerializerMethodField()
    discount_percent = serializers.IntegerField(read_only=True)
    average_rating = serializers.SerializerMethodField()
    is_available = serializers.BooleanField(read_only=True)
    related_products = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug',
            'category', 'stone_type', 'tags',
            'description', 'short_description',
            'price', 'compare_price', 'discount_percent',
            'sku', 'weight', 'silver_weight', 'silver_grade',
            'stock', 'is_available', 'is_featured', 'status',
            'images', 'reviews', 'average_rating',
            'related_products',
            'views_count', 'sales_count',
            'meta_title', 'meta_description',
            'created_at', 'updated_at',
        ]

    def get_reviews(self, obj):
        approved = obj.reviews.filter(is_approved=True).select_related('user')
        return ProductReviewSerializer(approved, many=True, context=self.context).data

    def get_average_rating(self, obj):
        return obj.average_rating()

    def get_related_products(self, obj):
        """Return up to 6 products in the same category (excluding self)."""
        qs = (
            Product.objects.filter(category=obj.category, status='active')
            .exclude(pk=obj.pk)
            .order_by('-sales_count')[:6]
        )
        return ProductListSerializer(qs, many=True, context=self.context).data
