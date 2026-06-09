'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { getCategories, getStoneTypes } from '@/lib/api'
import { Category, StoneType } from '@/types'
import { formatPrice, toPersianDigits } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface FilterState {
  category: string
  stone_type: string[]
  min_price: string
  max_price: string
  silver_grade: string
  ordering: string
}

const silverGrades = [
  { value: '', label: 'همه عیارها' },
  { value: '925', label: 'نقره ۹۲۵' },
  { value: '999', label: 'نقره ۹۹۹' },
  { value: '835', label: 'نقره ۸۳۵' },
  { value: '800', label: 'نقره ۸۰۰' },
]

const sortOptions = [
  { value: '-created_at', label: 'جدیدترین' },
  { value: 'price', label: 'ارزان‌ترین' },
  { value: '-price', label: 'گران‌ترین' },
  { value: '-sales_count', label: 'پرفروش‌ترین' },
  { value: '-views_count', label: 'محبوب‌ترین' },
]

export default function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [categories, setCategories] = useState<Category[]>([])
  const [stoneTypes, setStoneTypes] = useState<StoneType[]>([])
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get('category') || '',
    stone_type: searchParams.get('stone_type')?.split(',').filter(Boolean) || [],
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    silver_grade: searchParams.get('silver_grade') || '',
    ordering: searchParams.get('ordering') || '-created_at',
  })

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {})
    getStoneTypes().then(setStoneTypes).catch(() => {})
  }, [])

  const applyFilters = useCallback(
    (newFilters: FilterState) => {
      const params = new URLSearchParams()
      if (newFilters.category) params.set('category', newFilters.category)
      if (newFilters.stone_type.length > 0)
        params.set('stone_type', newFilters.stone_type.join(','))
      if (newFilters.min_price) params.set('min_price', newFilters.min_price)
      if (newFilters.max_price) params.set('max_price', newFilters.max_price)
      if (newFilters.silver_grade) params.set('silver_grade', newFilters.silver_grade)
      if (newFilters.ordering) params.set('ordering', newFilters.ordering)
      params.set('page', '1')
      router.push(`/products?${params.toString()}`)
    },
    [router]
  )

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    applyFilters(newFilters)
  }

  const toggleStoneType = (slug: string) => {
    const newTypes = filters.stone_type.includes(slug)
      ? filters.stone_type.filter((s) => s !== slug)
      : [...filters.stone_type, slug]
    updateFilter('stone_type', newTypes)
  }

  const resetFilters = () => {
    const cleared: FilterState = {
      category: '',
      stone_type: [],
      min_price: '',
      max_price: '',
      silver_grade: '',
      ordering: '-created_at',
    }
    setFilters(cleared)
    router.push('/products')
  }

  const hasActiveFilters =
    filters.category ||
    filters.stone_type.length > 0 ||
    filters.min_price ||
    filters.max_price ||
    filters.silver_grade

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Reset */}
      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors font-medium"
        >
          <X className="w-4 h-4" />
          پاک کردن فیلترها
        </button>
      )}

      {/* Sort */}
      <div>
        <h3 className="font-bold text-dark mb-3 text-sm flex items-center gap-2">
          <ChevronDown className="w-4 h-4 text-gold" />
          مرتب‌سازی
        </h3>
        <div className="space-y-1.5">
          {sortOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="ordering"
                value={opt.value}
                checked={filters.ordering === opt.value}
                onChange={() => updateFilter('ordering', opt.value)}
                className="w-4 h-4 accent-gold"
              />
              <span className="text-sm text-gray-600 group-hover:text-gold transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-bold text-dark mb-3 text-sm flex items-center gap-2">
          <ChevronDown className="w-4 h-4 text-gold" />
          دسته‌بندی
        </h3>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="radio"
              name="category"
              value=""
              checked={filters.category === ''}
              onChange={() => updateFilter('category', '')}
              className="w-4 h-4 accent-gold"
            />
            <span className="text-sm text-gray-600 group-hover:text-gold transition-colors">
              همه دسته‌ها
            </span>
          </label>
          {categories
            .filter((c) => !c.parent)
            .map((cat) => (
              <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  value={cat.slug}
                  checked={filters.category === cat.slug}
                  onChange={() => updateFilter('category', cat.slug)}
                  className="w-4 h-4 accent-gold"
                />
                <span
                  className={cn(
                    'text-sm transition-colors',
                    filters.category === cat.slug
                      ? 'text-gold font-medium'
                      : 'text-gray-600 group-hover:text-gold'
                  )}
                >
                  {cat.name}
                </span>
              </label>
            ))}
        </div>
      </div>

      {/* Stone Types */}
      {stoneTypes.length > 0 && (
        <div>
          <h3 className="font-bold text-dark mb-3 text-sm flex items-center gap-2">
            <ChevronDown className="w-4 h-4 text-gold" />
            نوع سنگ
          </h3>
          <div className="space-y-1.5">
            {stoneTypes.map((stone) => (
              <label key={stone.id} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.stone_type.includes(stone.slug)}
                  onChange={() => toggleStoneType(stone.slug)}
                  className="w-4 h-4 accent-gold rounded"
                />
                <span
                  className={cn(
                    'text-sm transition-colors',
                    filters.stone_type.includes(stone.slug)
                      ? 'text-gold font-medium'
                      : 'text-gray-600 group-hover:text-gold'
                  )}
                >
                  {stone.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="font-bold text-dark mb-3 text-sm flex items-center gap-2">
          <ChevronDown className="w-4 h-4 text-gold" />
          محدوده قیمت (تومان)
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">حداقل قیمت</label>
            <input
              type="number"
              value={filters.min_price}
              onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
              onBlur={() => applyFilters(filters)}
              placeholder="۰"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">حداکثر قیمت</label>
            <input
              type="number"
              value={filters.max_price}
              onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
              onBlur={() => applyFilters(filters)}
              placeholder="بدون محدودیت"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Silver Grade */}
      <div>
        <h3 className="font-bold text-dark mb-3 text-sm flex items-center gap-2">
          <ChevronDown className="w-4 h-4 text-gold" />
          عیار نقره
        </h3>
        <div className="space-y-1.5">
          {silverGrades.map((grade) => (
            <label key={grade.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="silver_grade"
                value={grade.value}
                checked={filters.silver_grade === grade.value}
                onChange={() => updateFilter('silver_grade', grade.value)}
                className="w-4 h-4 accent-gold"
              />
              <span
                className={cn(
                  'text-sm transition-colors',
                  filters.silver_grade === grade.value
                    ? 'text-gold font-medium'
                    : 'text-gray-600 group-hover:text-gold'
                )}
              >
                {grade.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="flex items-center gap-2 bg-dark text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gold transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          فیلترها
          {hasActiveFilters && (
            <span className="bg-gold text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-80 bg-white z-50 lg:hidden overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
              <h2 className="font-bold text-dark flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-gold" />
                فیلترها
              </h2>
              <button onClick={() => setIsMobileOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              <FilterContent />
            </div>
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-36">
          <h2 className="font-bold text-dark text-base mb-6 pb-3 border-b border-gray-100 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gold" />
            فیلترها
          </h2>
          <FilterContent />
        </div>
      </div>
    </>
  )
}
