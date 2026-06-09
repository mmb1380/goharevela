"""
Views for the products app.
"""
from django.db import transaction
from django.db.models import F
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .filters import ProductFilter
from .models import Category, Product, ProductReview, StoneType
from .serializers import (
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    ProductReviewCreateSerializer,
    ProductReviewSerializer,
    StoneTypeSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/products/categories/        – list all active categories (tree)
    GET /api/products/categories/<slug>/ – retrieve single category by slug
    """
    serializer_class = CategorySerializer
    lookup_field = 'slug'

    def get_queryset(self):
        # Return only root-level active categories; children are nested
        return (
            Category.objects
            .filter(is_active=True, parent__isnull=True)
            .prefetch_related('children__children')
        )

    @action(detail=False, methods=['get'], url_path='all')
    def all_flat(self, request):
        """GET /api/products/categories/all/ – flat list of all active categories."""
        qs = Category.objects.filter(is_active=True).order_by('order', 'name')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class StoneTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/products/stones/        – list all active stone types
    GET /api/products/stones/<slug>/ – retrieve single stone type
    """
    queryset = StoneType.objects.filter(is_active=True)
    serializer_class = StoneTypeSerializer
    lookup_field = 'slug'


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/products/                    – list products (with filtering/search)
    GET /api/products/<slug>/             – product detail (increments views_count)
    GET /api/products/featured/           – featured products
    GET /api/products/<slug>/related/     – related products
    POST /api/products/<slug>/add_review/ – submit a review (auth required)
    """
    lookup_field = 'slug'
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'short_description', 'sku']
    ordering_fields = ['price', 'created_at', 'sales_count', 'views_count']
    ordering = ['-created_at']

    def get_queryset(self):
        return (
            Product.objects
            .filter(status='active')
            .select_related('category', 'stone_type')
            .prefetch_related('images', 'tags', 'reviews')
        )

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment views_count atomically
        Product.objects.filter(pk=instance.pk).update(views_count=F('views_count') + 1)
        instance.refresh_from_db(fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """GET /api/products/featured/ – up to 12 featured products."""
        qs = self.get_queryset().filter(is_featured=True)[:12]
        serializer = ProductListSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def related(self, request, slug=None):
        """GET /api/products/<slug>/related/ – related products in same category."""
        product = self.get_object()
        qs = (
            self.get_queryset()
            .filter(category=product.category)
            .exclude(pk=product.pk)
            .order_by('-sales_count')[:6]
        )
        serializer = ProductListSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(
        detail=True,
        methods=['post'],
        url_path='add-review',
        permission_classes=[permissions.IsAuthenticated],
    )
    def add_review(self, request, slug=None):
        """POST /api/products/<slug>/add-review/ – submit a review."""
        product = self.get_object()
        if ProductReview.objects.filter(product=product, user=request.user).exists():
            return Response(
                {'detail': 'شما قبلاً برای این محصول نظر ثبت کرده‌اید.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = ProductReviewCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(product=product, user=request.user)
        return Response(
            {'detail': 'نظر شما با موفقیت ثبت شد و پس از تأیید نمایش داده خواهد شد.'},
            status=status.HTTP_201_CREATED,
        )


class ProductReviewViewSet(viewsets.GenericViewSet):
    """
    GET  /api/products/reviews/?product=<id>  – approved reviews for a product
    POST /api/products/reviews/               – create review (auth required)
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action == 'create':
            return ProductReviewCreateSerializer
        return ProductReviewSerializer

    def list(self, request):
        product_id = request.query_params.get('product')
        if not product_id:
            return Response(
                {'detail': 'پارامتر product الزامی است.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        qs = (
            ProductReview.objects
            .filter(product_id=product_id, is_approved=True)
            .select_related('user')
            .order_by('-created_at')
        )
        serializer = ProductReviewSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    def create(self, request):
        serializer = ProductReviewCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product_id = request.data.get('product')
        product = get_object_or_404(Product, pk=product_id)
        if ProductReview.objects.filter(product=product, user=request.user).exists():
            return Response(
                {'detail': 'شما قبلاً برای این محصول نظر ثبت کرده‌اید.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer.save(product=product, user=request.user)
        return Response(
            {'detail': 'نظر شما ثبت شد.'},
            status=status.HTTP_201_CREATED,
        )
