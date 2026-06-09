import { Product } from '@/types'
import { ProductCard, ProductCardSkeleton } from './ProductCard'
import { cn } from '@/lib/utils'
import { PackageSearch } from 'lucide-react'

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  skeletonCount?: number
  className?: string
  emptyMessage?: string
}

export default function ProductGrid({
  products,
  loading = false,
  skeletonCount = 8,
  className,
  emptyMessage = 'محصولی یافت نشد',
}: ProductGridProps) {
  const gridClass = cn(
    'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6',
    className
  )

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <PackageSearch className="w-20 h-20 text-gray-200 mb-4" />
        <h3 className="text-lg font-medium text-gray-500 mb-2">{emptyMessage}</h3>
        <p className="text-sm text-gray-400">
          فیلترهای خود را تغییر دهید یا بعداً مراجعه کنید
        </p>
      </div>
    )
  }

  return (
    <div className={gridClass}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
