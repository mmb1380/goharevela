'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const slides = [
  {
    id: 1,
    title: 'زیورآلات نقره اصیل ایرانی',
    subtitle: 'با بیش از ۷۰ سال سابقه در عرضه بهترین نقره',
    cta: 'مشاهده مجموعه',
    href: '/products',
    badge: 'جدید ۱۴۰۳',
    accent: '#b8860b',
  },
  {
    id: 2,
    title: 'انگشترهای نقره دست ساز',
    subtitle: 'طرح‌های منحصربه‌فرد توسط هنرمندان ایرانی',
    cta: 'خرید انگشتر',
    href: '/products?category=angoshtar',
    badge: 'ویژه',
    accent: '#8b6509',
  },
  {
    id: 3,
    title: 'سرویس‌های کامل نقره ۹۲۵',
    subtitle: 'ست کامل گردنبند، انگشتر و دستبند با ضمانت اصالت',
    cta: 'مشاهده سرویس‌ها',
    href: '/products?category=servis',
    badge: '۲۰٪ تخفیف',
    accent: '#d4a017',
  },
]

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length)
  }, [])

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, isPaused])

  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: '500px' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            'absolute inset-0 transition-opacity duration-700',
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          )}
          style={{
            background: `linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 40%, #2a2a1a 100%)`,
          }}
        >
          {/* Decorative elements */}
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl"
            style={{ background: slide.accent }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10 blur-2xl"
            style={{ background: slide.accent }}
          />
          <div
            className="absolute top-10 right-10 w-3 h-3 rounded-full opacity-40"
            style={{ background: slide.accent }}
          />
          <div
            className="absolute bottom-16 left-16 w-2 h-2 rounded-full opacity-30"
            style={{ background: slide.accent }}
          />
          <div className="absolute top-1/2 -translate-y-1/2 right-8 w-px h-32 opacity-20"
            style={{ background: `linear-gradient(to bottom, transparent, ${slide.accent}, transparent)` }}
          />

          {/* Content */}
          <div className="container mx-auto px-4 h-full flex items-center" style={{ minHeight: '500px' }}>
            <div className="max-w-2xl text-white">
              <span
                className="inline-block text-sm font-medium px-4 py-1.5 rounded-full mb-6 border"
                style={{
                  color: slide.accent,
                  borderColor: slide.accent + '40',
                  background: slide.accent + '15',
                }}
              >
                {slide.badge}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                {slide.title}
              </h1>
              <p className="text-gray-300 text-lg md:text-xl mb-10 leading-8">
                {slide.subtitle}
              </p>
              <div className="flex items-center gap-4">
                <Link
                  href={slide.href}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-medium text-base transition-all hover:scale-105 hover:shadow-xl"
                  style={{
                    background: `linear-gradient(135deg, ${slide.accent}, #8b6509)`,
                    boxShadow: `0 8px 32px ${slide.accent}40`,
                  }}
                >
                  {slide.cta}
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-4 rounded-xl font-medium text-base border border-white/20 hover:bg-white/10 transition-colors text-white"
                >
                  تماس با ما
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/30 hover:bg-gold text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
      <button
        onClick={next}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/30 hover:bg-gold text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              'rounded-full transition-all duration-300',
              i === current
                ? 'w-8 h-2.5 bg-gold'
                : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
            )}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute top-6 left-6 z-20 text-white/50 text-sm font-mono">
        {current + 1} / {slides.length}
      </div>
    </section>
  )
}
