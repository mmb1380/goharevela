'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingCart, Heart, Share2, Plus, Minus, CheckCircle, XCircle, AlertCircle, Tag, Weight } from 'lucide-react'
import { Product } from '@/types'
import { formatPrice, getImageUrl, getSilverGradeLabel, toPersianDigits } from '@/lib/utils'
import { useCartStore } from '@/lib/store'
import { RatingDisplay } from '@/components/ui/StarRating'
import { cn } from '@/lib/utils'

interface Props {
  product: Product
}

export default function ProductDetailClient({ product }: Props) {
  const [selectedImage, setSelectedImage] = useState(
    product.primary_image || product.images?.[0]?.image || null
  )
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { addItem, isLoading } = useCartStore()

  const handleAddToCart = async () => {
    if (!product.is_available) return
    try {
      await addItem(product.id, quantity)
    } catch {
      // handled in store
    }
  }

  const stockStatus = () => {
    if (!product.is_available || product.stock === 0) {
      return {
        icon: <XCircle className="w-4 h-4" />,
        text: 'ناموجود',
        color: 'text-red-500',
      }
    }
    if (product.stock <= 5) {
      return {
        icon: <AlertCircle className="w-4 h-4" />,
        text: `فقط ${toPersianDigits(product.stock.toString())} عدد باقی مانده`,
        color: 'text-orange-500',
      }
    }
    return {
      icon: <CheckCircle className="w-4 h-4" />,
      text: 'موجود در انبار',
      color: 'text-green-600',
    }
  }

  const stock = stockStatus()

  const allImages = product.images?.length
    ? product.images.map((img) => img.image)
    : product.primary_image
    ? [product.primary_image]
    : []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Image Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 img-zoom-container border border-gray-100">
          {selectedImage ? (
            <Image
              src={getImageUrl(selectedImage)}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">
              💎
            </div>
          )}

          {/* Badges on main image */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {product.discount_percent && product.discount_percent > 0 && (
              <span className="bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                {toPersianDigits(product.discount_percent.toString())}٪ تخفیف
              </span>
            )}
            {product.is_featured && (
              <span className="bg-gold text-white text-sm font-bold px-3 py-1.5 rounded-full">
                محصول ویژه
              </span>
            )}
          </div>
        </div>

        {/* Thumbnails */}
        {allImages.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(img)}
                className={cn(
                  'relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all',
                  selectedImage === img
                    ? 'border-gold shadow-md scale-105'
                    : 'border-transparent hover:border-gray-300'
                )}
              >
                <Image
                  src={getImageUrl(img)}
                  alt={`تصویر ${toPersianDigits((i + 1).toString())}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        {/* Category + Name */}
        <div>
          <p className="text-sm text-gray-400 mb-2">{product.category?.name}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-dark leading-tight mb-3">
            {product.name}
          </h1>
          <div className="flex items-center gap-4">
            <RatingDisplay
              rating={product.average_rating}
              reviewsCount={product.reviews_count}
              size="md"
            />
            <span className="text-sm text-gray-400">
              کد محصول: {product.sku}
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="bg-gray-50 rounded-2xl p-5">
          {product.compare_price && parseFloat(product.compare_price) > parseFloat(product.price) ? (
            <div className="flex items-center gap-3 mb-1">
              <span className="text-gray-400 line-through text-base">
                {formatPrice(product.compare_price)}
              </span>
              {product.discount_percent && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {toPersianDigits(product.discount_percent.toString())}٪ تخفیف
                </span>
              )}
            </div>
          ) : null}
          <div className="text-3xl font-bold text-gold">
            {formatPrice(product.price)}
          </div>
          <p className="text-xs text-gray-400 mt-1.5">قیمت به تومان — شامل مالیات</p>
        </div>

        {/* Short Description */}
        {product.short_description && (
          <p className="text-gray-600 leading-8 text-sm border-r-2 border-gold pr-4">
            {product.short_description}
          </p>
        )}

        {/* Specs Badges */}
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 bg-gold/10 text-gold text-xs font-medium px-3 py-1.5 rounded-full">
            <Tag className="w-3.5 h-3.5" />
            {getSilverGradeLabel(product.silver_grade ?? '')}
          </span>
          {product.weight && (
            <span className="flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">
              <Weight className="w-3.5 h-3.5" />
              وزن: {product.weight} گرم
            </span>
          )}
          {product.stone_type && (
            <span className="flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-full">
              💎 {product.stone_type.name}
            </span>
          )}
          {(product.tags ?? []).map((tag) => (
            <span
              key={tag.id}
              className="bg-gray-100 text-gray-500 text-xs px-3 py-1.5 rounded-full"
            >
              #{tag.name}
            </span>
          ))}
        </div>

        {/* Stock Status */}
        <div className={cn('flex items-center gap-2 text-sm font-medium', stock.color)}>
          {stock.icon}
          {stock.text}
        </div>

        {/* Quantity + Add to Cart */}
        {product.is_available && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">تعداد:</span>
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gold hover:text-white transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-base">
                  {toPersianDigits(quantity.toString())}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gold hover:text-white transition-colors"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-gray-400">
                حداکثر {toPersianDigits(product.stock.toString())} عدد
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-gold text-white py-4 rounded-xl font-medium text-base hover:bg-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-gold/25"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ShoppingCart className="w-5 h-5" />
                )}
                افزودن به سبد خرید
              </button>

              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center border-2 transition-all',
                  isWishlisted
                    ? 'bg-red-50 border-red-300 text-red-500'
                    : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400'
                )}
              >
                <Heart className={cn('w-5 h-5', isWishlisted && 'fill-current')} />
              </button>

              <button className="w-14 h-14 rounded-xl flex items-center justify-center border-2 border-gray-200 text-gray-400 hover:border-gold hover:text-gold transition-all">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {!product.is_available && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-600 font-medium">این محصول در حال حاضر موجود نیست</p>
            <p className="text-red-400 text-sm mt-1">برای اطلاع از موجودی با ما تماس بگیرید</p>
          </div>
        )}

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-2xl mb-1">🏅</div>
            <p className="text-xs text-gray-500">ضمانت اصالت</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🚚</div>
            <p className="text-xs text-gray-500">ارسال سریع</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">↩</div>
            <p className="text-xs text-gray-500">مرجوعی ۷ روزه</p>
          </div>
        </div>
      </div>
    </div>
  )
}
