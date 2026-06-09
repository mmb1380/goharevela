import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProduct, getRelatedProducts, getProductReviews } from '@/lib/api'
import { formatPrice, getImageUrl, getPersianDate, getSilverGradeLabel, toPersianDigits } from '@/lib/utils'
import ProductDetailClient from './ProductDetailClient'
import ProductGrid from '@/components/product/ProductGrid'
import { StarRating } from '@/components/ui/StarRating'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const product = await getProduct(params.slug)
    return {
      title: product.name,
      description: product.short_description || product.description?.slice(0, 160),
      openGraph: {
        title: product.name,
        description: product.short_description,
        images: product.primary_image ? [getImageUrl(product.primary_image)] : [],
        type: 'website',
      },
    }
  } catch {
    return { title: 'محصول' }
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  let product
  try {
    product = await getProduct(params.slug)
  } catch {
    notFound()
  }

  const [relatedProducts, reviews] = await Promise.allSettled([
    getRelatedProducts(product.id, product.category?.slug ?? ''),
    getProductReviews(product.id),
  ])

  const related = relatedProducts.status === 'fulfilled' ? relatedProducts.value : []
  const reviewList = reviews.status === 'fulfilled' ? reviews.value : []

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gold transition-colors">خانه</Link>
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <Link href="/products" className="hover:text-gold transition-colors">محصولات</Link>
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <Link
              href={`/products?category=${product.category?.slug ?? ''}`}
              className="hover:text-gold transition-colors"
            >
              {product.category?.name}
            </Link>
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span className="text-dark font-medium truncate max-w-48">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Product Detail - Client Component for interactivity */}
        <ProductDetailClient product={product} />

        {/* Tabs Section */}
        <div className="mt-16 border-t border-gray-100 pt-10">
          <ProductTabs product={product} reviews={reviewList} />
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16 border-t border-gray-100 pt-10">
            <h2 className="text-2xl font-bold text-dark mb-8">محصولات مشابه</h2>
            <ProductGrid products={related} />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Product Tabs ─────────────────────────────────────────────────────────────

function ProductTabs({
  product,
  reviews,
}: {
  product: Awaited<ReturnType<typeof getProduct>>
  reviews: Awaited<ReturnType<typeof getProductReviews>>
}) {
  return (
    <div>
      {/* Tab Headers (static for server component) */}
      <div className="border-b border-gray-200 mb-8 flex gap-0 overflow-x-auto">
        <div className="px-6 py-3 border-b-2 border-gold text-gold font-medium text-sm whitespace-nowrap">
          توضیحات
        </div>
        <div className="px-6 py-3 text-gray-500 text-sm whitespace-nowrap">مشخصات</div>
        <div className="px-6 py-3 text-gray-500 text-sm whitespace-nowrap">
          نظرات ({toPersianDigits(reviews.length.toString())})
        </div>
      </div>

      {/* Description */}
      <div className="prose max-w-none text-gray-600 leading-8 text-sm mb-10">
        {product.description ? (
          <p>{product.description}</p>
        ) : (
          <p className="text-gray-400">توضیحاتی برای این محصول ثبت نشده است.</p>
        )}
      </div>

      {/* Specifications */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-10">
        <h3 className="font-bold text-dark mb-4 text-base">مشخصات فنی</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: 'کد محصول (SKU)', value: product.sku },
            { label: 'عیار نقره', value: getSilverGradeLabel(product.silver_grade ?? '') },
            { label: 'وزن کل', value: product.weight ? `${product.weight} گرم` : '—' },
            { label: 'وزن نقره', value: product.silver_weight ? `${product.silver_weight} گرم` : '—' },
            { label: 'نوع سنگ', value: product.stone_type?.name || 'بدون سنگ' },
            { label: 'دسته‌بندی', value: product.category?.name ?? '—' },
            { label: 'وضعیت موجودی', value: product.is_available ? `${toPersianDigits(product.stock.toString())} عدد` : 'ناموجود' },
          ].map((spec) => (
            <div
              key={spec.label}
              className="flex items-center justify-between py-2.5 border-b border-gray-200 last:border-0"
            >
              <span className="text-sm text-gray-500">{spec.label}</span>
              <span className="text-sm font-medium text-dark">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-dark text-lg">
            نظرات مشتریان ({toPersianDigits(reviews.length.toString())})
          </h3>
          {product.average_rating && (
            <div className="flex items-center gap-3 bg-gold/10 px-4 py-2 rounded-xl">
              <span className="text-2xl font-bold text-gold">
                {product.average_rating.toFixed(1)}
              </span>
              <StarRating rating={product.average_rating} size="md" />
              <span className="text-sm text-gray-500">از ۵</span>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <p className="text-gray-400 text-sm">
              هنوز نظری ثبت نشده است. اولین نفر باشید!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-medium text-dark text-sm mb-1">
                      {review.user.full_name}
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  <span className="text-xs text-gray-400">
                    {getPersianDate(review.created_at)}
                  </span>
                </div>
                {review.title && (
                  <h4 className="font-medium text-dark text-sm mb-2">{review.title}</h4>
                )}
                <p className="text-sm text-gray-600 leading-7">{review.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
