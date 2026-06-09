'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Eye } from 'lucide-react'
import { Product } from '@/types'
import { formatPrice, getImageUrl, toPersianDigits } from '@/lib/utils'
import { useCartStore } from '@/lib/store'
import { RatingDisplay } from '@/components/ui/StarRating'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem, isLoading } = useCartStore()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!product.is_available) return
    try {
      await addItem(product.id, 1)
    } catch {
      // handled in store
    }
  }

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
  }

  const imageUrl = !imageError
    ? getImageUrl(product.primary_image)
    : '/placeholder-jewelry.jpg'

  return (
    <div
      className={cn(
        'bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group card-hover',
        className
      )}
    >
      {/* Image Container */}
      <div className="relative img-zoom-container aspect-square bg-gray-50">
        <Link href={`/products/${product.slug}`}>
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImageError(true)}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {product.discount_percent && product.discount_percent > 0 ? (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {toPersianDigits(product.discount_percent.toString())}٪ تخفیف
            </span>
          ) : null}
          {product.is_featured && (
            <span className="bg-gold text-white text-xs font-bold px-2 py-1 rounded-full">
              ویژه
            </span>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {!product.is_available && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-full">
              ناموجود
            </span>
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <button
            onClick={toggleWishlist}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors',
              isWishlisted
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-500 hover:text-red-500'
            )}
            title={isWishlisted ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
          >
            <Heart className={cn('w-4 h-4', isWishlisted && 'fill-current')} />
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="w-9 h-9 bg-white text-gray-500 hover:text-gold rounded-full flex items-center justify-center shadow-md transition-colors"
            title="مشاهده محصول"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs text-gray-400 mb-1">{product.category?.name}</p>

        {/* Product Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-dark hover:text-gold transition-colors line-clamp-2 mb-2 leading-6">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <RatingDisplay
          rating={product.average_rating}
          reviewsCount={product.reviews_count ?? 0}
          className="mb-3"
        />

        {/* Price */}
        <div className="flex items-end justify-between gap-2">
          <div>
            {product.compare_price && parseFloat(product.compare_price) > parseFloat(product.price) ? (
              <p className="text-xs text-gray-400 line-through mb-0.5">
                {formatPrice(product.compare_price)}
              </p>
            ) : null}
            <p className="text-base font-bold text-gold">
              {formatPrice(product.price)}
            </p>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={!product.is_available || isLoading}
            className={cn(
              'flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition-all duration-200',
              product.is_available
                ? 'bg-dark text-white hover:bg-gold active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {product.is_available ? 'افزودن به سبد' : 'ناموجود'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function ProductCardSkeleton() {
  return <SkeletonCard />
}

export default ProductCard
