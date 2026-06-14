import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Shield,
  Truck,
  RotateCcw,
  Lock,
  Headphones,
  Gift,
  Star,
  Award,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import ProductGrid from '@/components/product/ProductGrid'
import { getImageUrl, getPersianDate } from '@/lib/utils'
import type { BlogListItem, Category, FeatureItem, Product, TrustItem } from '@/types'

// نگاشت نام آیکن (از پنل) به آیکن lucide
const TRUST_ICONS: Record<string, LucideIcon> = {
  shield: Shield,
  truck: Truck,
  rotate: RotateCcw,
  lock: Lock,
  headphones: Headphones,
  gift: Gift,
  star: Star,
  award: Award,
}

// آیکن پیش‌فرض دسته‌بندی‌ها بر اساس اسلاگ
const CATEGORY_ICONS: Record<string, string> = {
  angoshtar: '💍', gerdanband: '📿', zanjir: '⛓', dastband: '🔗',
  servis: '✨', tasbih: '🔮', saat: '⌚', hamayel: '🌟',
}

// ─── Trust Bar ────────────────────────────────────────────────────────────────
export function TrustBar({ items }: { items: TrustItem[] }) {
  return (
    <section className="bg-dark text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {items.map((item) => {
            const Icon = TRUST_ICONS[item.icon] ?? Shield
            return (
              <div
                key={item.title}
                className="flex flex-col items-center text-center gap-2 group"
              >
                <div className="text-gold group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm">{item.title}</div>
                  {item.description && (
                    <div className="text-gray-400 text-xs mt-0.5">{item.description}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Featured Categories ──────────────────────────────────────────────────────
export function CategoriesSection({
  heading,
  subheading,
  categories,
}: {
  heading: string
  subheading?: string
  categories: Category[]
}) {
  const displayCategories =
    categories.length > 0
      ? categories.filter((c) => !c.parent).slice(0, 8)
      : [
          { id: 1, name: 'انگشتر', slug: 'angoshtar', icon: '💍', image: null },
          { id: 2, name: 'گردنبند', slug: 'gerdanband', icon: '📿', image: null },
          { id: 3, name: 'زنجیر', slug: 'zanjir', icon: '⛓', image: null },
          { id: 4, name: 'دستبند', slug: 'dastband', icon: '🔗', image: null },
          { id: 5, name: 'سرویس', slug: 'servis', icon: '✨', image: null },
          { id: 6, name: 'تسبیح', slug: 'tasbih', icon: '🔮', image: null },
          { id: 7, name: 'ساعت', slug: 'saat', icon: '⌚', image: null },
          { id: 8, name: 'ویژه', slug: '', icon: '🏅', image: null },
        ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-dark mb-3">{heading}</h2>
          {subheading && <p className="text-gray-500">{subheading}</p>}
        </div>
        <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {displayCategories.map((cat) => {
            const catWithIcon = cat as typeof cat & { icon?: string }
            const icon = catWithIcon.icon || CATEGORY_ICONS[cat.slug] || '💎'
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl hover:shadow-md hover:scale-105 transition-all duration-300 group border border-gray-100"
              >
                <div className="w-14 h-14 bg-gold/10 rounded-xl flex items-center justify-center text-3xl group-hover:bg-gold/20 transition-colors">
                  {icon}
                </div>
                <span className="text-xs md:text-sm font-medium text-dark text-center group-hover:text-gold transition-colors">
                  {cat.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Products Section ─────────────────────────────────────────────────────────
export function ProductSection({
  heading,
  subheading,
  linkText,
  linkUrl,
  products,
  altBg = false,
}: {
  heading: string
  subheading?: string
  linkText?: string
  linkUrl?: string
  products: Product[]
  altBg?: boolean
}) {
  return (
    <section className={altBg ? 'py-16 bg-gray-50' : 'py-16'}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-dark mb-2">{heading}</h2>
            {subheading && <p className="text-gray-500">{subheading}</p>}
          </div>
          {linkUrl && (
            <Link
              href={linkUrl}
              className="flex items-center gap-2 text-gold hover:text-gold-dark font-medium transition-colors group"
            >
              <span>{linkText || 'مشاهده همه'}</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
        <ProductGrid products={products} loading={false} />
      </div>
    </section>
  )
}

// ─── Special Offer Banner ────────────────────────────────────────────────────
export function SpecialOffer({
  badge,
  title,
  description,
  buttonText,
  buttonLink,
}: {
  badge?: string
  title: string
  description?: string
  buttonText?: string
  buttonLink?: string
}) {
  return (
    <section className="py-4">
      <div className="container mx-auto px-4">
        <div
          className="relative overflow-hidden rounded-3xl text-white py-16 px-8 text-center"
          style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
          }}
        >
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full border-2 border-gold/20" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full border-2 border-gold/10" />
          <div className="absolute top-1/2 right-1/4 w-8 h-8 rounded-full bg-gold/20" />
          <div className="absolute top-1/4 left-1/3 w-6 h-6 rounded-full bg-gold/15" />

          <div className="relative z-10">
            {badge && (
              <span className="inline-block bg-gold/20 text-gold text-sm font-medium px-4 py-1.5 rounded-full mb-4">
                {badge}
              </span>
            )}
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            {description && (
              <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">{description}</p>
            )}
            {buttonLink && (
              <Link
                href={buttonLink}
                className="inline-flex items-center gap-2 bg-gold text-white px-8 py-3.5 rounded-xl text-base font-medium hover:bg-gold-dark transition-colors shadow-lg hover:shadow-gold/25"
              >
                {buttonText || 'خرید اکنون'}
                <ArrowLeft className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Features Section ─────────────────────────────────────────────────────────
export function Features({
  heading,
  subheading,
  items,
}: {
  heading: string
  subheading?: string
  items: FeatureItem[]
}) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-dark mb-3">{heading}</h2>
          {subheading && <p className="text-gray-500 max-w-xl mx-auto">{subheading}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((f) => (
            <div
              key={f.title}
              className="text-center group p-6 rounded-2xl hover:bg-gold/5 transition-colors border border-transparent hover:border-gold/20"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform inline-block">
                {f.icon}
              </div>
              <h3 className="font-bold text-dark text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-7">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Blog Preview ─────────────────────────────────────────────────────────────
const BLOG_FALLBACK_EMOJIS = ['📝', '💎', '✨']

export function BlogPreviewSection({
  heading,
  subheading,
  linkText,
  posts = [],
}: {
  heading: string
  subheading?: string
  linkText?: string
  posts?: BlogListItem[]
}) {
  // اگر مقاله‌ای منتشر نشده باشد، این بخش نمایش داده نمی‌شود.
  if (posts.length === 0) return null

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-dark mb-2">{heading}</h2>
            {subheading && <p className="text-gray-500">{subheading}</p>}
          </div>
          <Link
            href="/blog"
            className="flex items-center gap-2 text-gold hover:text-gold-dark font-medium transition-colors group"
          >
            <span>{linkText || 'مشاهده همه'}</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.slice(0, 3).map((post, i) => (
            <Link
              key={post.id}
              href={`/blog/${post.meta.slug}`}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-md transition-shadow card-hover"
            >
              <div className="relative h-48 bg-gradient-to-br from-dark to-gray-700 flex items-center justify-center overflow-hidden">
                {post.cover_image ? (
                  <Image
                    src={getImageUrl(post.cover_image.full_url || post.cover_image.url)}
                    alt={post.cover_image.alt || post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <span className="text-6xl">{BLOG_FALLBACK_EMOJIS[i % BLOG_FALLBACK_EMOJIS.length]}</span>
                )}
              </div>
              <div className="p-5">
                <p className="text-xs text-gray-400 mb-2">{getPersianDate(post.date)}</p>
                <h3 className="font-bold text-dark text-base mb-2 group-hover:text-gold transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 leading-6">{post.intro}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Newsletter ───────────────────────────────────────────────────────────────
export function Newsletter({
  title,
  description,
  buttonText,
}: {
  title: string
  description?: string
  buttonText?: string
}) {
  return (
    <section
      className="py-16"
      style={{ background: 'linear-gradient(135deg, #b8860b 0%, #d4a017 50%, #8b6509 100%)' }}
    >
      <div className="container mx-auto px-4 text-center text-white">
        <h2 className="text-3xl font-bold mb-3">{title}</h2>
        {description && (
          <p className="text-white/80 mb-8 max-w-md mx-auto text-lg">{description}</p>
        )}
        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" action="#">
          <input
            type="email"
            placeholder="آدرس ایمیل شما"
            className="flex-1 px-5 py-3 rounded-xl text-dark text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            dir="ltr"
          />
          <button
            type="submit"
            className="bg-dark text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            {buttonText || 'عضویت'}
          </button>
        </form>
        <p className="text-white/60 text-xs mt-4">
          هیچ اسپامی نمی‌فرستیم. هر زمان می‌توانید لغو اشتراک کنید.
        </p>
      </div>
    </section>
  )
}
