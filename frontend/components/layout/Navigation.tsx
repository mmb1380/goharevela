'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'
import { getCategories } from '@/lib/api'
import { loadSiteConfig } from '@/lib/siteConfig'
import { Category, MenuLink } from '@/types'
import { cn } from '@/lib/utils'

type MenuItem = { label: string; href: string; slug?: string; newTab?: boolean }

// استخراج اسلاگ دسته‌بندی از لینک (برای نمایش زیرمنو)
function categorySlugFromLink(link: string): string | undefined {
  if (!link.includes('category=')) return undefined
  return decodeURIComponent(link.split('category=')[1]?.split('&')[0] ?? '') || undefined
}

export default function Navigation() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [mainMenu, setMainMenu] = useState<MenuLink[]>([])
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownTimeout = useRef<NodeJS.Timeout>()

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {})
    loadSiteConfig()
      .then((cfg) => setMainMenu(cfg?.menus?.main ?? []))
      .catch(() => {})
  }, [])

  // دسته‌بندی‌های اصلی مستقیم از پنل ادمین (دیتابیس) خوانده می‌شوند
  const topCategories = categories
    .filter((c) => c.parent === null && c.is_active !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  // اگر منوی اصلی در پنل تعریف شده باشد از آن استفاده می‌شود، وگرنه چیدمان پیش‌فرض
  const menuItems: MenuItem[] =
    mainMenu.length > 0
      ? mainMenu.map((m) => ({
          label: m.label,
          href: m.link,
          slug: categorySlugFromLink(m.link),
          newTab: m.open_in_new_tab,
        }))
      : [
          { label: 'خانه', href: '/' },
          ...topCategories.map((c) => ({
            label: c.name,
            href: `/products?category=${c.slug}`,
            slug: c.slug,
          })),
          { label: 'وبلاگ', href: '/blog' },
          { label: 'تماس با ما', href: '/contact' },
        ]

  const getCategoryChildren = (slug: string): Category[] => {
    const cat = categories.find((c) => c.slug === slug)
    if (!cat) return []
    return categories
      .filter((c) => c.parent === cat.id && c.is_active !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }

  const handleMouseEnter = (slug: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current)
    setOpenDropdown(slug)
  }

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setOpenDropdown(null)
    }, 200)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-dark text-white hidden md:block sticky top-[73px] z-40 shadow-lg">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-center">
            {menuItems.map((item) => {
              const children = item.slug ? getCategoryChildren(item.slug) : []
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href.split('?')[0]))

              return (
                <li
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.slug && handleMouseEnter(item.slug)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-1 px-4 py-3.5 text-sm font-medium transition-all duration-200 whitespace-nowrap border-b-2',
                      isActive
                        ? 'text-gold border-gold'
                        : 'text-gray-300 border-transparent hover:text-gold hover:border-gold'
                    )}
                  >
                    {item.label}
                    {children.length > 0 && (
                      <ChevronDown
                        className={cn(
                          'w-3.5 h-3.5 transition-transform',
                          openDropdown === item.slug && 'rotate-180'
                        )}
                      />
                    )}
                  </Link>

                  {/* Dropdown */}
                  {children.length > 0 && openDropdown === item.slug && (
                    <div
                      className="absolute top-full right-0 bg-white text-dark shadow-xl rounded-b-xl min-w-48 py-2 border border-gray-100 z-50"
                      onMouseEnter={() => item.slug && handleMouseEnter(item.slug)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/products?category=${child.slug}`}
                          className="block px-4 py-2.5 text-sm hover:bg-gold/10 hover:text-gold transition-colors"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile Navigation Toggle */}
      <div className="md:hidden bg-dark text-white px-4 py-3 flex items-center justify-between sticky top-[119px] z-40">
        <span className="text-sm font-medium text-gray-300">منو</span>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="text-white hover:text-gold transition-colors"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-72 bg-dark text-white z-50 md:hidden overflow-y-auto animate-slideInRight">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <span className="font-bold text-gold text-lg">گوهر ولا</span>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <ul className="py-4">
              {menuItems.map((item) => {
                const children = item.slug ? getCategoryChildren(item.slug) : []
                const isActive = pathname === item.href

                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        'block px-6 py-3.5 text-sm border-b border-gray-800 transition-colors',
                        isActive
                          ? 'text-gold bg-gold/10'
                          : 'text-gray-300 hover:text-gold hover:bg-white/5'
                      )}
                    >
                      {item.label}
                    </Link>
                    {children.length > 0 && (
                      <ul className="bg-dark/50">
                        {children.map((child) => (
                          <li key={child.id}>
                            <Link
                              href={`/products?category=${child.slug}`}
                              onClick={() => setIsMobileOpen(false)}
                              className="block px-10 py-2.5 text-sm text-gray-400 hover:text-gold border-b border-gray-800/50 transition-colors"
                            >
                              — {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </>
      )}
    </>
  )
}
