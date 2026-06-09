import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Shield, Truck, RotateCcw, Lock, Headphones } from 'lucide-react'
import { getFeaturedProducts, getNewArrivals, getBestSellers, getCategories } from '@/lib/api'
import ProductGrid from '@/components/product/ProductGrid'
import { SkeletonCard } from '@/components/ui/Skeleton'
import HeroSlider from './HeroSlider'

// Render on each request so newly added products/categories appear immediately.
export const dynamic = 'force-dynamic'

// ─── Hero Slider (client) ─────────────────────────────────────────────────────

// ─── Trust Bar ────────────────────────────────────────────────────────────────

function TrustBar() {
  const items = [
    { icon: <Shield className="w-6 h-6" />, title: 'ضمانت اصالت', desc: 'نقره خالص تضمینی' },
    { icon: <Truck className="w-6 h-6" />, title: 'ارسال سریع', desc: 'سراسر ایران' },
    { icon: <RotateCcw className="w-6 h-6" />, title: 'مرجوعی ۷ روزه', desc: 'بدون سوال' },
    { icon: <Lock className="w-6 h-6" />, title: 'پرداخت امن', desc: 'درگاه معتبر بانکی' },
    { icon: <Headphones className="w-6 h-6" />, title: 'پشتیبانی ۲۴/۷', desc: 'همیشه در کنار شما' },
  ]

  return (
    <section className="bg-dark text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center text-center gap-2 group"
            >
              <div className="text-gold group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div>
                <div className="font-bold text-sm">{item.title}</div>
                <div className="text-gray-400 text-xs mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Featured Categories ──────────────────────────────────────────────────────

async function FeaturedCategories() {
  let categories: Awaited<ReturnType<typeof getCategories>> = []
  try {
    categories = await getCategories()
  } catch {}

  const displayCategories = categories.length > 0
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

  const icons: Record<string, string> = {
    angoshtar: '💍', gerdanband: '📿', zanjir: '⛓', dastband: '🔗',
    servis: '✨', tasbih: '🔮', saat: '⌚', hamayel: '🌟',
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-dark mb-3">دسته‌بندی محصولات</h2>
          <p className="text-gray-500">مجموعه کاملی از زیورآلات نقره اصیل</p>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {displayCategories.map((cat) => {
            const catWithIcon = cat as typeof cat & { icon?: string }
            const icon = catWithIcon.icon || icons[cat.slug] || '💎'
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

// ─── New Arrivals ─────────────────────────────────────────────────────────────

async function NewArrivals() {
  let products: Awaited<ReturnType<typeof getNewArrivals>> = []
  try {
    products = await getNewArrivals()
  } catch {}

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-dark mb-2">جدیدترین محصولات</h2>
            <p className="text-gray-500">تازه‌ترین اضافات به مجموعه ما</p>
          </div>
          <Link
            href="/products?ordering=-created_at"
            className="flex items-center gap-2 text-gold hover:text-gold-dark font-medium transition-colors group"
          >
            <span>مشاهده همه</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
        <ProductGrid products={products} loading={false} />
      </div>
    </section>
  )
}

// ─── Special Offer Banner ────────────────────────────────────────────────────

function SpecialOfferBanner() {
  return (
    <section className="py-4">
      <div className="container mx-auto px-4">
        <div
          className="relative overflow-hidden rounded-3xl text-white py-16 px-8 text-center"
          style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
          }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full border-2 border-gold/20" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full border-2 border-gold/10" />
          <div className="absolute top-1/2 right-1/4 w-8 h-8 rounded-full bg-gold/20" />
          <div className="absolute top-1/4 left-1/3 w-6 h-6 rounded-full bg-gold/15" />

          <div className="relative z-10">
            <span className="inline-block bg-gold/20 text-gold text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              پیشنهاد ویژه
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              تخفیف ۲۰٪ روی سرویس‌های کامل
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
              فقط تا پایان این هفته — ست‌های کامل انگشتر، گردنبند و دستبند
              نقره ۹۲۵ با قیمت استثنایی
            </p>
            <Link
              href="/products?category=servis"
              className="inline-flex items-center gap-2 bg-gold text-white px-8 py-3.5 rounded-xl text-base font-medium hover:bg-gold-dark transition-colors shadow-lg hover:shadow-gold/25"
            >
              خرید اکنون
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Best Sellers ─────────────────────────────────────────────────────────────

async function BestSellers() {
  let products: Awaited<ReturnType<typeof getBestSellers>> = []
  try {
    products = await getBestSellers()
  } catch {}

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-dark mb-2">پرفروش‌ترین محصولات</h2>
            <p className="text-gray-500">محبوب‌ترین انتخاب‌های مشتریان</p>
          </div>
          <Link
            href="/products?ordering=-sales_count"
            className="flex items-center gap-2 text-gold hover:text-gold-dark font-medium transition-colors group"
          >
            <span>مشاهده همه</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
        <ProductGrid products={products} loading={false} />
      </div>
    </section>
  )
}

// ─── Features Section ─────────────────────────────────────────────────────────

function FeaturesSection() {
  const features = [
    {
      icon: '🏛️',
      title: '۷۰ سال سابقه',
      desc: 'از سال ۱۳۳۲ در خدمت خانواده‌های ایرانی با بهترین کیفیت و صادقانه‌ترین قیمت.',
    },
    {
      icon: '🔬',
      title: 'آزمایشگاه تست',
      desc: 'تمامی محصولات قبل از ارائه در آزمایشگاه معتبر تست عیار می‌شوند.',
    },
    {
      icon: '🎁',
      title: 'بسته‌بندی هدیه',
      desc: 'ارائه جعبه هدیه لاکچری رایگان برای تمامی سفارشات.',
    },
    {
      icon: '🔧',
      title: 'تعمیرات نقره',
      desc: 'خدمات تعمیر و پولیش حرفه‌ای زیورآلات نقره توسط استادکاران مجرب.',
    },
  ]

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-dark mb-3">چرا گوهر ولا؟</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            ما به کیفیت، صداقت و رضایت مشتریانمان متعهدیم
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="text-center group p-6 rounded-2xl hover:bg-gold/5 transition-colors border border-transparent hover:border-gold/20"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform inline-block">
                {f.icon}
              </div>
              <h3 className="font-bold text-dark text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-7">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Blog Preview ─────────────────────────────────────────────────────────────

function BlogPreview() {
  const posts = [
    {
      id: 1,
      title: 'راهنمای نگهداری زیورآلات نقره',
      excerpt: 'برای حفظ زیبایی و درخشش زیورآلات نقره خود باید...',
      date: '۱۴۰۳/۰۳/۱۵',
      image: '📝',
      slug: 'care-guide',
    },
    {
      id: 2,
      title: 'تفاوت نقره ۹۲۵ و ۹۹۹',
      excerpt: 'آشنایی با انواع عیار نقره و تفاوت‌های کاربردی آن‌ها...',
      date: '۱۴۰۳/۰۳/۰۸',
      image: '💎',
      slug: 'silver-grades',
    },
    {
      id: 3,
      title: 'ترندهای جواهرات نقره در سال ۱۴۰۳',
      excerpt: 'جدیدترین مدل‌ها و طرح‌های زیورآلات نقره که امسال...',
      date: '۱۴۰۳/۰۲/۲۵',
      image: '✨',
      slug: 'trends-1403',
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-dark mb-2">آخرین مطالب</h2>
            <p className="text-gray-500">راهنمایی و اخبار دنیای جواهرات</p>
          </div>
          <Link
            href="/blog"
            className="flex items-center gap-2 text-gold hover:text-gold-dark font-medium transition-colors group"
          >
            <span>مشاهده همه</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-md transition-shadow card-hover"
            >
              <div className="h-48 bg-gradient-to-br from-dark to-gray-700 flex items-center justify-center text-6xl">
                {post.image}
              </div>
              <div className="p-5">
                <p className="text-xs text-gray-400 mb-2">{post.date}</p>
                <h3 className="font-bold text-dark text-base mb-2 group-hover:text-gold transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 leading-6">
                  {post.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

function Newsletter() {
  return (
    <section
      className="py-16"
      style={{ background: 'linear-gradient(135deg, #b8860b 0%, #d4a017 50%, #8b6509 100%)' }}
    >
      <div className="container mx-auto px-4 text-center text-white">
        <h2 className="text-3xl font-bold mb-3">خبرنامه گوهر ولا</h2>
        <p className="text-white/80 mb-8 max-w-md mx-auto text-lg">
          اولین نفری باشید که از تخفیف‌ها و محصولات جدید باخبر می‌شود
        </p>
        <form
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          action="#"
        >
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
            عضویت رایگان
          </button>
        </form>
        <p className="text-white/60 text-xs mt-4">
          هیچ اسپامی نمی‌فرستیم. هر زمان می‌توانید لغو اشتراک کنید.
        </p>
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  return (
    <div>
      <HeroSlider />
      <TrustBar />
      <FeaturedCategories />
      <Suspense
        fallback={
          <div className="py-16 container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        }
      >
        <NewArrivals />
      </Suspense>
      <SpecialOfferBanner />
      <Suspense
        fallback={
          <div className="py-16 container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        }
      >
        <BestSellers />
      </Suspense>
      <FeaturesSection />
      <BlogPreview />
      <Newsletter />
    </div>
  )
}
