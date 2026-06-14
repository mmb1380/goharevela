import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Calendar, User as UserIcon, ArrowRight } from 'lucide-react'
import { getBlogPost, getWagtailImage } from '@/lib/api'
import { getImageUrl, getPersianDate } from '@/lib/utils'
import type { BlogBodyBlock } from '@/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getBlogPost(params.slug)
  if (!post) return { title: 'مقاله یافت نشد' }
  return {
    title: post.title,
    description: post.intro,
    openGraph: {
      title: post.title,
      description: post.intro,
      images: post.cover_image ? [getImageUrl(post.cover_image.full_url || post.cover_image.url)] : [],
    },
  }
}

// رندر یک بلوک از بدنه مقاله (StreamField وگتیل)
function renderBlock(block: BlogBodyBlock, images: Record<number, { url: string; title: string }>) {
  switch (block.type) {
    case 'heading':
      return (
        <h2 key={block.id} className="text-2xl font-bold text-dark mt-8 mb-3">
          {block.value}
        </h2>
      )
    case 'paragraph':
      return (
        <div
          key={block.id}
          className="prose prose-lg max-w-none text-gray-700 leading-8 mb-4 [&_a]:text-gold [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: block.value }}
        />
      )
    case 'image': {
      const img = images[block.value]
      if (!img?.url) return null
      return (
        <figure key={block.id} className="my-8">
          <img
            src={getImageUrl(img.url)}
            alt={img.title}
            className="w-full rounded-2xl"
          />
          {img.title && (
            <figcaption className="text-center text-sm text-gray-400 mt-2">{img.title}</figcaption>
          )}
        </figure>
      )
    }
    case 'quote':
      return (
        <blockquote
          key={block.id}
          className="border-r-4 border-gold bg-gold/5 rounded-l-xl px-6 py-4 my-6 text-dark"
        >
          <p className="text-lg leading-8">«{block.value.text}»</p>
          {block.value.author && (
            <footer className="text-sm text-gray-500 mt-2">— {block.value.author}</footer>
          )}
        </blockquote>
      )
    default:
      return null
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getBlogPost(params.slug)
  if (!post) notFound()

  // تصاویر داخل بدنه را از قبل resolve می‌کنیم (بلوک image فقط شناسه است)
  const imageIds = Array.from(
    new Set(post.body.filter((b) => b.type === 'image').map((b) => b.value as number))
  )
  const resolved = await Promise.all(imageIds.map((id) => getWagtailImage(id)))
  const images: Record<number, { url: string; title: string }> = {}
  imageIds.forEach((id, i) => {
    const r = resolved[i]
    if (r) images[id] = r
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Cover */}
      {post.cover_image && (
        <div className="relative h-64 md:h-96 bg-dark">
          <Image
            src={getImageUrl(post.cover_image.full_url || post.cover_image.url)}
            alt={post.cover_image.alt || post.title}
            fill
            className="object-cover opacity-80"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <article className="container mx-auto px-4 max-w-3xl py-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gold transition-colors mb-6"
        >
          <ArrowRight className="w-4 h-4" />
          بازگشت به وبلاگ
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-dark mb-4 leading-relaxed">
          {post.title}
        </h1>

        <div className="flex items-center gap-5 text-sm text-gray-400 mb-8 pb-6 border-b border-gray-100">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {getPersianDate(post.date)}
          </span>
          {post.author && (
            <span className="flex items-center gap-1.5">
              <UserIcon className="w-4 h-4" />
              {post.author}
            </span>
          )}
        </div>

        {post.intro && (
          <p className="text-lg text-gray-600 leading-8 mb-8 font-medium">{post.intro}</p>
        )}

        <div>{post.body.map((block) => renderBlock(block, images))}</div>

        {post.tag_list && post.tag_list.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-gray-100">
            {post.tag_list.map((tag) => (
              <span key={tag} className="text-sm bg-gold/10 text-gold px-3 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </div>
  )
}
