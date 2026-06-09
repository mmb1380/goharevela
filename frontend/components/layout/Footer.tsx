'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Phone, MapPin, Mail, Clock } from 'lucide-react'
import { getCategories } from '@/lib/api'
import { Category } from '@/types'

const quickLinks = [
  { label: 'درباره ما', href: '/about' },
  { label: 'محصولات', href: '/products' },
  { label: 'وبلاگ', href: '/blog' },
  { label: 'تماس با ما', href: '/contact' },
  { label: 'سوالات متداول', href: '/faq' },
  { label: 'قوانین و مقررات', href: '/terms' },
  { label: 'حریم خصوصی', href: '/privacy' },
  { label: 'راهنمای خرید', href: '/guide' },
]

export default function Footer() {
  const [categories, setCategories] = useState<{ label: string; href: string }[]>([])

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
  }, [])

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
                <div className="text-xl font-bold text-white">گوهر ولا</div>
                <div className="text-xs text-gray-500 tracking-widest">
                  GOHAREVELA
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-7 mb-6">
              گوهر ولا با سال‌ها سابقه درخشان در عرضه زیورآلات نقره
              اصیل ایرانی، افتخار دارد بهترین محصولات را با ضمانت اصالت به
              شما عرضه نماید.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/goharevela"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-700 hover:bg-gold rounded-full flex items-center justify-center transition-colors"
                aria-label="اینستاگرام"
              >
                <span className="text-sm">📸</span>
              </a>
              <a
                href="https://t.me/goharevela"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-700 hover:bg-gold rounded-full flex items-center justify-center transition-colors"
                aria-label="تلگرام"
              >
                <span className="text-sm">✈</span>
              </a>
              <a
                href="https://wa.me/989120001234"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-700 hover:bg-gold rounded-full flex items-center justify-center transition-colors"
                aria-label="واتس‌اپ"
              >
                <span className="text-sm">💬</span>
              </a>
              <a
                href="https://aparat.com/goharevela"
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
                <li key={link.href}>
                  <Link
                    href={link.href}
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
                  تهران، بازار طلا و جواهر، گوهر ولا
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                <a
                  href="tel:+982188001234"
                  className="text-sm text-gray-400 hover:text-gold transition-colors"
                  dir="ltr"
                >
                  ۰۲۱-۸۸۰۰۱۲۳۴
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                <a
                  href="tel:+989120001234"
                  className="text-sm text-gray-400 hover:text-gold transition-colors"
                  dir="ltr"
                >
                  ۰۹۱۲-۰۰۰۱۲۳۴
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold flex-shrink-0" />
                <a
                  href="mailto:info@goharevela.ir"
                  className="text-sm text-gray-400 hover:text-gold transition-colors"
                  dir="ltr"
                >
                  info@goharevela.ir
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-400 leading-6">
                  <div>شنبه تا پنج‌شنبه: ۹ صبح تا ۶ عصر</div>
                  <div>جمعه: تعطیل</div>
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
              © {new Date().getFullYear()} گوهر ولا — تمامی حقوق محفوظ است
            </span>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="hover:text-gray-400 transition-colors">
                قوانین
              </Link>
              <Link href="/privacy" className="hover:text-gray-400 transition-colors">
                حریم خصوصی
              </Link>
              <Link href="/sitemap" className="hover:text-gray-400 transition-colors">
                نقشه سایت
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
