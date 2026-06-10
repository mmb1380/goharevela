import {
  getHomePage,
  getNewArrivals,
  getBestSellers,
  getFeaturedProducts,
  getCategories,
} from '@/lib/api'
import HeroSlider from './HeroSlider'
import {
  TrustBar,
  CategoriesSection,
  ProductSection,
  SpecialOffer,
  Features,
  BlogPreviewSection,
  Newsletter,
} from '@/components/home/sections'
import type { Category, FeatureItem, HomeBlock, Product, TrustItem } from '@/types'

// Render on each request so newly added products/categories/CMS edits appear immediately.
export const dynamic = 'force-dynamic'

// مقادیر پیش‌فرض (وقتی صفحه اصلی در پنل هنوز محتوا ندارد)
const DEFAULT_TRUST: TrustItem[] = [
  { icon: 'shield', title: 'ضمانت اصالت', description: 'نقره خالص تضمینی' },
  { icon: 'truck', title: 'ارسال سریع', description: 'سراسر ایران' },
  { icon: 'rotate', title: 'مرجوعی ۷ روزه', description: 'بدون سوال' },
  { icon: 'lock', title: 'پرداخت امن', description: 'درگاه معتبر بانکی' },
  { icon: 'headphones', title: 'پشتیبانی ۲۴/۷', description: 'همیشه در کنار شما' },
]

const DEFAULT_FEATURES: FeatureItem[] = [
  { icon: '🏛️', title: '۷۰ سال سابقه', description: 'از سال ۱۳۳۲ در خدمت خانواده‌های ایرانی با بهترین کیفیت و صادقانه‌ترین قیمت.' },
  { icon: '🔬', title: 'آزمایشگاه تست', description: 'تمامی محصولات قبل از ارائه در آزمایشگاه معتبر تست عیار می‌شوند.' },
  { icon: '🎁', title: 'بسته‌بندی هدیه', description: 'ارائه جعبه هدیه لاکچری رایگان برای تمامی سفارشات.' },
  { icon: '🔧', title: 'تعمیرات نقره', description: 'خدمات تعمیر و پولیش حرفه‌ای زیورآلات نقره توسط استادکاران مجرب.' },
]

function renderBlock(
  block: HomeBlock,
  ctx: { categories: Category[]; productsBySource: Record<string, Product[]> },
) {
  switch (block.type) {
    case 'hero_slider':
      return <HeroSlider key={block.id} slides={block.value.slides} />
    case 'trust_bar':
      return <TrustBar key={block.id} items={block.value.items} />
    case 'categories':
      return (
        <CategoriesSection
          key={block.id}
          heading={block.value.heading}
          subheading={block.value.subheading}
          categories={ctx.categories}
        />
      )
    case 'products':
      return (
        <ProductSection
          key={block.id}
          heading={block.value.heading}
          subheading={block.value.subheading}
          linkText={block.value.link_text}
          linkUrl={block.value.link_url}
          products={ctx.productsBySource[block.value.source] ?? []}
          altBg={block.value.source === 'bestsellers'}
        />
      )
    case 'special_offer':
      return (
        <SpecialOffer
          key={block.id}
          badge={block.value.badge}
          title={block.value.title}
          description={block.value.description}
          buttonText={block.value.button_text}
          buttonLink={block.value.button_link}
        />
      )
    case 'features':
      return (
        <Features
          key={block.id}
          heading={block.value.heading}
          subheading={block.value.subheading}
          items={block.value.items}
        />
      )
    case 'blog_preview':
      return (
        <BlogPreviewSection
          key={block.id}
          heading={block.value.heading}
          subheading={block.value.subheading}
          linkText={block.value.link_text}
        />
      )
    case 'newsletter':
      return (
        <Newsletter
          key={block.id}
          title={block.value.title}
          description={block.value.description}
          buttonText={block.value.button_text}
        />
      )
    default:
      return null
  }
}

export default async function HomePage() {
  const [home, categories, newArrivals, bestSellers, featured] = await Promise.all([
    getHomePage(),
    getCategories().catch(() => [] as Category[]),
    getNewArrivals().catch(() => [] as Product[]),
    getBestSellers().catch(() => [] as Product[]),
    getFeaturedProducts().catch(() => [] as Product[]),
  ])

  const productsBySource: Record<string, Product[]> = {
    new: newArrivals,
    bestsellers: bestSellers,
    featured,
  }

  const blocks = home?.body ?? []

  // مسیر اصلی: رندر بخش‌ها بر اساس ترتیب تعریف‌شده در پنل
  if (blocks.length > 0) {
    return <div>{blocks.map((block) => renderBlock(block, { categories, productsBySource }))}</div>
  }

  // fallback: چیدمان پیش‌فرض (وقتی هنوز در پنل محتوایی تعریف نشده)
  return (
    <div>
      <HeroSlider />
      <TrustBar items={DEFAULT_TRUST} />
      <CategoriesSection
        heading="دسته‌بندی محصولات"
        subheading="مجموعه کاملی از زیورآلات نقره اصیل"
        categories={categories}
      />
      <ProductSection
        heading="جدیدترین محصولات"
        subheading="تازه‌ترین اضافات به مجموعه ما"
        linkText="مشاهده همه"
        linkUrl="/products?ordering=-created_at"
        products={newArrivals}
      />
      <SpecialOffer
        badge="پیشنهاد ویژه"
        title="تخفیف ۲۰٪ روی سرویس‌های کامل"
        description="فقط تا پایان این هفته — ست‌های کامل انگشتر، گردنبند و دستبند نقره ۹۲۵ با قیمت استثنایی"
        buttonText="خرید اکنون"
        buttonLink="/products?category=servis"
      />
      <ProductSection
        heading="پرفروش‌ترین محصولات"
        subheading="محبوب‌ترین انتخاب‌های مشتریان"
        linkText="مشاهده همه"
        linkUrl="/products?ordering=-sales_count"
        products={bestSellers}
        altBg
      />
      <Features
        heading="چرا گوهر ولا؟"
        subheading="ما به کیفیت، صداقت و رضایت مشتریانمان متعهدیم"
        items={DEFAULT_FEATURES}
      />
      <BlogPreviewSection
        heading="آخرین مطالب"
        subheading="راهنمایی و اخبار دنیای جواهرات"
        linkText="مشاهده همه"
      />
      <Newsletter
        title="خبرنامه گوهر ولا"
        description="اولین نفری باشید که از تخفیف‌ها و محصولات جدید باخبر می‌شود"
        buttonText="عضویت رایگان"
      />
    </div>
  )
}
