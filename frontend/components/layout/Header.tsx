'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ShoppingBag, User, Phone, Clock, Instagram } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store'
import { useAuthStore } from '@/lib/store'
import { loadSiteConfig } from '@/lib/siteConfig'
import { toPersianDigits } from '@/lib/utils'
import type { SiteSettings } from '@/types'

export default function Header() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const { cart, openCart, fetchCart } = useCartStore()
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    fetchCart()
    loadSiteConfig()
      .then((cfg) => setSettings(cfg?.settings ?? null))
      .catch(() => {})
  }, [fetchCart])

  const phone = settings?.phone_primary || '۰۲۱-۸۸۰۰۱۲۳۴'
  const workingHours = settings?.working_hours || 'شنبه تا پنج‌شنبه ۹ تا ۱۸'
  const topbarMessage =
    settings?.topbar_message || 'ارسال رایگان برای خریدهای بالای ۵۰۰ هزار تومان'
  const brandName = settings?.brand_name || 'گوهر ولا'
  const brandLatin = settings?.brand_latin || 'GOHAREVELA'

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search.trim())}`)
    }
  }

  const itemCount = cart?.item_count ?? 0

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      {/* Top Bar */}
      <div className="bg-dark text-gray-300 py-2">
        <div className="container mx-auto px-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-1.5 hover:text-gold transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{toPersianDigits(phone)}</span>
            </a>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{workingHours}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={settings?.instagram || 'https://instagram.com/goharevela'}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors"
              aria-label="اینستاگرام"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={settings?.telegram || 'https://t.me/goharevela'}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors text-sm"
              aria-label="تلگرام"
            >
              ✈
            </a>
            <span className="text-gray-600">|</span>
            <span>{topbarMessage}</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 lg:gap-8">
            {/* Logo */}
            <Link
              href="/"
              className="flex-shrink-0 flex flex-col items-center group"
            >
              <div className="flex items-center gap-2">
                <span className="text-3xl leading-none">💎</span>
                <div>
                  <div className="text-xl font-bold text-dark group-hover:text-gold transition-colors leading-tight">
                    {brandName}
                  </div>
                  <div className="text-xs text-gray-500 tracking-widest">
                    {brandLatin}
                  </div>
                </div>
              </div>
            </Link>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="flex-1 relative max-w-xl mx-auto hidden md:block"
            >
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجو در محصولات... (انگشتر، گردنبند، زنجیر)"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-2.5 pr-12 text-sm placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-auto md:ml-0">
              {/* Cart Button */}
              <button
                onClick={openCart}
                className="relative flex items-center gap-2 bg-gold text-white px-4 py-2.5 rounded-xl hover:bg-gold-dark transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">سبد خرید</span>
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {toPersianDigits(itemCount.toString())}
                  </span>
                )}
              </button>

              {/* User Button */}
              {isAuthenticated ? (
                <Link
                  href="/profile"
                  className="flex items-center gap-2 bg-gray-100 text-dark px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium hidden sm:inline">
                    {user?.first_name || 'حساب من'}
                  </span>
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 bg-gray-100 text-dark px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium hidden sm:inline">ورود</span>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="mt-3 relative md:hidden">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در محصولات..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-2.5 pr-12 text-sm placeholder:text-gray-400 focus:outline-none focus:border-gold transition-all"
            />
            <button
              type="submit"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
