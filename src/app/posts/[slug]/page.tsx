import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { MobileNavigation } from '@/components/layout/mobile-navigation'
import { SearchButton } from '@/components/layout/search-button'
import { icons } from '@/components/ui/icons'
import { LazyImage } from '@/components/ui/lazy-image'
import { MarkdownContent } from '@/components/ui/markdown-content'
import { content } from '@/content'
import { ArticleActions } from '@/features/posts/components/article-actions'
import { ArticleEngagement } from '@/features/posts/components/article-engagement'
import { ArticleSidebar } from '@/features/posts/components/article-sidebar'
import { formatPostDate } from '@/features/posts/format'
import { readHeadings } from '@/features/posts/read-headings'
import { readPost, readPosts } from '@/features/posts/read-posts'

export function generateStaticParams() {
  return readPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = readPost(slug)

  if (!post) notFound()

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      images: [post.cover]
    }
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = readPost(slug)

  if (!post) notFound()

  const headings = readHeadings(post.content)
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  if (!turnstileSiteKey) {
    throw new Error('NEXT_PUBLIC_TURNSTILE_SITE_KEY is not configured')
  }

  return (
    <>
      <MobileNavigation />
      <main className="mx-auto grid min-h-screen w-[min(1480px,calc(100%-64px))] grid-cols-[394px_minmax(0,1fr)] max-[1200px]:w-[calc(100%-40px)] max-[1200px]:grid-cols-[324px_minmax(0,1fr)] max-[760px]:block max-[760px]:min-h-0 max-[760px]:w-full">
        <ArticleSidebar headings={headings} />
        <section className="min-w-0 px-10 pt-[23px] pb-[120px] max-[760px]:px-[18px] max-[760px]:pt-14 max-[760px]:pb-[70px] max-[380px]:px-4">
          <header className="flex min-h-[42px] items-start gap-7 max-[760px]:min-h-0">
            <SearchButton className="mt-0.5" />
            <h1 className="min-w-0 text-[clamp(28px,2.6vw,40px)] leading-[1.28] font-[750] tracking-[-0.04em] max-[760px]:text-[28px]">{post.title}</h1>
          </header>

          <div className="mr-[68px] ml-[68px] max-w-[1040px] max-[1200px]:mx-[48px] max-[760px]:mx-0">
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground/70 max-[760px]:mt-5 max-[760px]:text-xs">
              <div className="flex items-center gap-5">
                <Link className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground" href={`/weekly/${encodeURIComponent(post.tags[0])}`}>{icons.articles}{post.tags[0]}</Link>
                <span className="inline-flex items-center gap-1.5">{icons.clock}{content.posts.labels.readingTimePrefix} {post.readingMinutes} {content.posts.labels.minutes}</span>
              </div>
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            </div>

            <LazyImage alt={post.title} className="mt-10 aspect-[2/1] w-full rounded-xl bg-muted object-cover shadow-[0_20px_55px_rgba(35,40,52,0.16)] dark:shadow-[0_20px_55px_rgba(0,0,0,0.42)] max-[760px]:mt-7 max-[760px]:aspect-[16/9] max-[760px]:shadow-[0_14px_36px_rgba(35,40,52,0.14)]" src={post.cover} />

            <article className="article-content mt-14 max-[760px]:mt-10">
              <MarkdownContent source={post.content} />
            </article>

            <ArticleEngagement postSlug={post.slug} turnstileSiteKey={turnstileSiteKey} />
          </div>
        </section>
      </main>
      <ArticleActions />
    </>
  )
}
