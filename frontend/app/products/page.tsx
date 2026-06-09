import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getProducts } from '@/lib/api'
import { ProductQueryParams } from '@/types'
import ProductGrid from '@/components/product/ProductGrid'
import ProductFilters from '@/components/product/ProductFilters'
import { toPersianDigits } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'همه محصولات',
  description: 'مجموعه کامل زیورآلات نقره گوهر ولا. انگشتر، گردنبند، زنجیر، دستبند و سرویس نقره.',
}

interface PageProps {
  searchParams: {
    category?: string
    stone_type?: string
    min_price?: string
    max_price?: string
    search?: string
    ordering?: string
    page?: string
    silver_grade?: string
  }
}

const PAGE_SIZE = 12

export default async function ProductsPage({ searchParams }: PageProps) {
  const page = parseInt(searchParams.page || '1')

  const queryParams: ProductQueryParams = {
    page,
    page_size: PAGE_SIZE,
  }

  if (searchParams.category) queryParams.category = searchParams.category
  if (searchParams.stone_type) queryParams.stone_type = searchParams.stone_type
  if (searchParams.min_price) queryParams.min_price = searchParams.min_price
  if (searchParams.max_price) queryParams.max_price = searchParams.max_price
  if (searchParams.search) queryParams.search = searchParams.search
  if (searchParams.ordering) queryParams.ordering = searchParams.ordering

  let data: Awaited<ReturnType<typeof getProducts>> = { count: 0, results: [], next: null, previous: null }
  try {
    data = await getProducts(queryParams)
  } catch {}

  const totalPages = Math.ceil(data.count / PAGE_SIZE)

  const sortLabels: Record<string, string> = {
    '-created_at': 'جدیدترین',
    price: 'ارزان‌ترین',
    '-price': 'گران‌ترین',
    '-sales_count': 'پرفروش‌ترین',
    '-views_count': 'محبوب‌ترین',
  }

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams()
    if (searchParams.category) params.set('category', searchParams.category)
    if (searchParams.stone_type) params.set('stone_type', searchParams.stone_type)
    if (searchParams.min_price) params.set('min_price', searchParams.min_price)
    if (searchParams.max_price) params.set('max_price', searchParams.max_price)
    if (searchParams.search) params.set('search', searchParams.search)
    if (searchParams.ordering) params.set('ordering', searchParams.ordering)
    params.set('page', p.toString())
    return `/products?${params.toString()}`
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gold transition-colors">
              خانه
            </Link>
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span className="text-dark font-medium">محصولات</span>
            {searchParams.search && (
              <>
                <ChevronLeft className="w-4 h-4 rotate-180" />
                <span className="text-gold">جستجو: {searchParams.search}</span>
              </>
            )}
            {searchParams.category && (
              <>
                <ChevronLeft className="w-4 h-4 rotate-180" />
                <span className="text-gold">{searchParams.category}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <ProductFilters />
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Sort Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
              <div className="text-sm text-gray-600">
                {data.count > 0 ? (
                  <span>
                    <strong className="text-dark">
                      {toPersianDigits(data.count.toString())}
                    </strong>{' '}
                    محصول یافت شد
                    {searchParams.search && (
                      <span className="text-gray-400">
                        {' '}
                        برای «{searchParams.search}»
                      </span>
                    )}
                  </span>
                ) : (
                  <span>جستجو در محصولات...</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>مرتب‌سازی:</span>
                <span className="text-gold font-medium">
                  {sortLabels[searchParams.ordering || '-created_at'] || 'جدیدترین'}
                </span>
              </div>
            </div>

            {/* Products Grid */}
            <ProductGrid
              products={data.results}
              loading={false}
              skeletonCount={PAGE_SIZE}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <Link
                  href={buildPageUrl(page - 1)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                    page <= 1
                      ? 'border-gray-200 text-gray-300 pointer-events-none'
                      : 'border-gray-200 text-gray-600 hover:border-gold hover:text-gold'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>

                {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                  let pageNum = i + 1
                  if (totalPages > 7) {
                    if (page <= 4) {
                      pageNum = i + 1
                    } else if (page >= totalPages - 3) {
                      pageNum = totalPages - 6 + i
                    } else {
                      pageNum = page - 3 + i
                    }
                  }

                  return (
                    <Link
                      key={pageNum}
                      href={buildPageUrl(pageNum)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors text-sm font-medium ${
                        pageNum === page
                          ? 'bg-gold border-gold text-white'
                          : 'border-gray-200 text-gray-600 hover:border-gold hover:text-gold'
                      }`}
                    >
                      {toPersianDigits(pageNum.toString())}
                    </Link>
                  )
                })}

                <Link
                  href={buildPageUrl(page + 1)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                    page >= totalPages
                      ? 'border-gray-200 text-gray-300 pointer-events-none'
                      : 'border-gray-200 text-gray-600 hover:border-gold hover:text-gold'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
