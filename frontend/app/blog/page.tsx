import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User as UserIcon, ArrowLeft } from 'lucide-react'
import { getBlogPosts } from '@/lib/api'
import { getImageUrl, getPersianDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'وبلاگ',
  description: 'آخرین مطالب، راهنماها و اخبار دنیای زیورآلات نقره گوهر ولا.',
}

// آیکن پیش‌فرض برای مقالاتی که تصویر شاخص ندارند
const FALLBACK_EMOJIS = ['📝', '💎', '✨', '📿', '⛓', '🔮']

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-dark text-white">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">وبلاگ گوهر ولا</h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            راهنماها، نکات نگهداری و آخرین اخبار دنیای زیورآلات نقره
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-bold text-dark mb-2">هنوز مطلبی منتشر نشده است</h2>
            <p className="text-gray-500">به‌زودی مطالب جدید اینجا قرار می‌گیرند.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <Link
                key={post.id}
                href={`/blog/${post.meta.slug}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-md transition-shadow flex flex-col"
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
                    <span className="text-6xl">
                      {FALLBACK_EMOJIS[i % FALLBACK_EMOJIS.length]}
                    </span>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {getPersianDate(post.date)}
                    </span>
                    {post.author && (
                      <span className="flex items-center gap-1">
                        <UserIcon className="w-3.5 h-3.5" />
                        {post.author}
                      </span>
                    )}
                  </div>
                  <h2 className="font-bold text-dark text-base mb-2 group-hover:text-gold transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-500 line-clamp-3 leading-6 flex-1">
                    {post.intro}
                  </p>
                  {post.tag_list && post.tag_list.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {post.tag_list.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-gold/10 text-gold px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="flex items-center gap-1 text-gold text-sm font-medium mt-4 group-hover:gap-2 transition-all">
                    ادامه مطلب
                    <ArrowLeft className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
