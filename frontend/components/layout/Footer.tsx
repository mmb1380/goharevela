'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Phone, MapPin, Mail, Clock } from 'lucide-react'
import { getCategories } from '@/lib/api'
import { loadSiteConfig } from '@/lib/siteConfig'
import { Category, MenuLink, SiteSettings } from '@/types'

const DEFAULT_QUICK_LINKS: MenuLink[] = [
  { label: 'درباره ما', link: '/about', open_in_new_tab: false },
  { label: 'محصولات', link: '/products', open_in_new_tab: false },
  { label: 'وبلاگ', link: '/blog', open_in_new_tab: false },
  { label: 'تماس با ما', link: '/contact', open_in_new_tab: false },
  { label: 'سوالات متداول', link: '/faq', open_in_new_tab: false },
  { label: 'قوانین و مقررات', link: '/terms', open_in_new_tab: false },
  { label: 'حریم خصوصی', link: '/privacy', open_in_new_tab: false },
  { label: 'راهنمای خرید', link: '/guide', open_in_new_tab: false },
]

const DEFAULT_BOTTOM_LINKS: MenuLink[] = [
  { label: 'قوانین', link: '/terms', open_in_new_tab: false },
  { label: 'حریم خصوصی', link: '/privacy', open_in_new_tab: false },
  { label: 'نقشه سایت', link: '/sitemap', open_in_new_tab: false },
]

export default function Footer() {
  const [categories, setCategories] = useState<{ label: string; href: string }[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [quickLinks, setQuickLinks] = useState<MenuLink[]>(DEFAULT_QUICK_LINKS)
  const [bottomLinks, setBottomLinks] = useState<MenuLink[]>(DEFAULT_BOTTOM_LINKS)

  useEffect(() => {
    getCategories()
      .then((cats: Category[]) => {
        const tops = cats
          .filter((c) => c.parent === null && c.is_active !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((c) => ({ label: c.name, href: `/products?category=${c.slug}` }))
        setCategories([
          ...tops,
          { label: 'محصولات ویژه', href: '/products?is_featured=true' },
        ])
      })
      .catch(() => {})
    loadSiteConfig()
      .then((cfg) => {
        if (!cfg) return
        setSettings(cfg.settings)
        if (cfg.menus?.footer_quick?.length) setQuickLinks(cfg.menus.footer_quick)
        if (cfg.menus?.footer_bottom?.length) setBottomLinks(cfg.menus.footer_bottom)
      })
      .catch(() => {})
  }, [])

  const brandName = settings?.brand_name || 'گوهر ولا'
  const brandLatin = settings?.brand_latin || 'GOHAREVELA'
  const brandDescription =
    settings?.brand_description ||
    'گوهر ولا با سال‌ها سابقه درخشان در عرضه زیورآلات نقره اصیل ایرانی، افتخار دارد بهترین محصولات را با ضمانت اصالت به شما عرضه نماید.'

  return (
    <footer className="bg-dark text-gray-300 mt-16">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* About */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">💎</span>
              <div>
                <div className="text-xl font-bold text-white">{brandName}</div>
                <div className="text-xs text-gray-500 tracking-widest">
                  {brandLatin}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-7 mb-6">{brandDescription}</p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href={settings?.instagram || 'https://instagram.com/goharevela'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-700 hover:bg-gold rounded-full flex items-center justify-center transition-colors"
                aria-label="اینستاگرام"
              >
                <span className="text-sm">📸</span>
              </a>
              <a
                href={settings?.telegram || 'https://t.me/goharevela'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-700 hover:bg-gold rounded-full flex items-center justify-center transition-colors"
                aria-label="تلگرام"
              >
                <span className="text-sm">✈</span>
              </a>
              <a
                href={settings?.whatsapp || 'https://wa.me/989120001234'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-700 hover:bg-gold rounded-full flex items-center justify-center transition-colors"
                aria-label="واتس‌اپ"
              >
                <span className="text-sm">💬</span>
              </a>
              <a
                href={settings?.aparat || 'https://aparat.com/goharevela'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-700 hover:bg-gold rounded-full flex items-center justify-center transition-colors"
                aria-label="آپارات"
              >
                <span className="text-sm">▶</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-base mb-5 pb-2 border-b border-gray-700 flex items-center gap-2">
              <span className="w-1 h-5 bg-gold rounded-full inline-block"></span>
              دسترسی سریع
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.link}>
                  <Link
                    href={link.link}
                    target={link.open_in_new_tab ? '_blank' : undefined}
                    className="text-sm text-gray-400 hover:text-gold transition-colors flex items-center gap-2 group"
                  >
                    <span className="text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                      ‹
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-bold text-base mb-5 pb-2 border-b border-gray-700 flex items-center gap-2">
              <span className="w-1 h-5 bg-gold rounded-full inline-block"></span>
              دسته‌بندی‌ها
            </h3>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    className="text-sm text-gray-400 hover:text-gold transition-colors flex items-center gap-2 group"
                  >
                    <span className="text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                      ‹
                    </span>
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-base mb-5 pb-2 border-b border-gray-700 flex items-center gap-2">
              <span className="w-1 h-5 bg-gold rounded-full inline-block"></span>
              اطلاعات تماس
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400 leading-6">
                  {settings?.address || 'تهران، بازار طلا و جواهر، گوهر ولا'}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                <a
                  href={`tel:${settings?.phone_primary || '۰۲۱-۸۸۰۰۱۲۳۴'}`}
                  className="text-sm text-gray-400 hover:text-gold transition-colors"
                  dir="ltr"
                >
                  {settings?.phone_primary || '۰۲۱-۸۸۰۰۱۲۳۴'}
                </a>
              </li>
              {(settings?.phone_secondary ?? '۰۹۱۲-۰۰۰۱۲۳۴') !== '' && (
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                  <a
                    href={`tel:${settings?.phone_secondary || '۰۹۱۲-۰۰۰۱۲۳۴'}`}
                    className="text-sm text-gray-400 hover:text-gold transition-colors"
                    dir="ltr"
                  >
                    {settings?.phone_secondary || '۰۹۱۲-۰۰۰۱۲۳۴'}
                  </a>
                </li>
              )}
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold flex-shrink-0" />
                <a
                  href={`mailto:${settings?.email || 'info@goharevela.ir'}`}
                  className="text-sm text-gray-400 hover:text-gold transition-colors"
                  dir="ltr"
                >
                  {settings?.email || 'info@goharevela.ir'}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-400 leading-6">
                  {settings?.working_hours || 'شنبه تا پنج‌شنبه: ۹ صبح تا ۶ عصر'}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span>🏅</span> ضمانت اصالت کالا
            </span>
            <span className="flex items-center gap-1.5">
              <span>🚚</span> ارسال سریع سراسر ایران
            </span>
            <span className="flex items-center gap-1.5">
              <span>🔒</span> پرداخت امن
            </span>
            <span className="flex items-center gap-1.5">
              <span>↩</span> مرجوعی ۷ روزه
            </span>
            <span className="flex items-center gap-1.5">
              <span>📞</span> پشتیبانی ۲۴ ساعته
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-black/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <span>
              © {new Date().getFullYear()} {brandName} — تمامی حقوق محفوظ است
            </span>
            <div className="flex items-center gap-4">
              {bottomLinks.map((link) => (
                <Link
                  key={link.link}
                  href={link.link}
                  target={link.open_in_new_tab ? '_blank' : undefined}
                  className="hover:text-gray-400 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
