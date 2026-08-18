import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import rehypeSlug from 'rehype-slug'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { MobileNavigation } from '@/components/layout/mobile-navigation'
import { Button } from '@/components/ui/button'
import { icons } from '@/components/ui/icons'
import { formatPostDate } from '@/features/posts/format'
import { readHeadings } from '@/features/posts/read-headings'
import { readPost, readPosts } from '@/features/posts/read-posts'

import { ArticleSidebar } from './_components/article-sidebar'
import { ArticleActions } from './_components/article-actions'

export function generateStaticParams() {
  return readPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = readPost(slug)

  if (!post) notFound()

  return {
    title: `${post.title} · Dijkstra`,
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

  return (
    <>
      <MobileNavigation />
      <main className="mx-auto grid min-h-screen w-[min(1480px,calc(100%-64px))] grid-cols-[380px_minmax(0,1fr)] max-[1200px]:w-[calc(100%-40px)] max-[1200px]:grid-cols-[310px_minmax(0,1fr)] max-[760px]:block max-[760px]:min-h-0 max-[760px]:w-full">
        <ArticleSidebar headings={headings} />
        <section className="min-w-0 px-10 pt-[23px] pb-[120px] max-[760px]:px-[18px] max-[760px]:pt-14 max-[760px]:pb-[70px] max-[380px]:px-4">
          <header className="flex min-h-[42px] items-start gap-7 max-[760px]:min-h-0">
            <Button aria-label="搜索文章" className="mt-0.5 size-10 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground max-[760px]:hidden" size="icon" variant="ghost">{icons.search}</Button>
            <h1 className="min-w-0 text-[clamp(28px,2.6vw,40px)] leading-[1.28] font-[750] tracking-[-0.04em] max-[760px]:text-[28px]">{post.title}</h1>
          </header>

          <div className="ml-[68px] max-w-[1040px] max-[1200px]:ml-[48px] max-[760px]:ml-0">
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground/70 max-[760px]:mt-5 max-[760px]:text-xs">
              <div className="flex items-center gap-5">
                <Link className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground" href={`/weekly/${encodeURIComponent(post.tags[0])}`}>{icons.articles}{post.tags[0]}</Link>
                <span className="inline-flex items-center gap-1.5">{icons.clock}约 {post.readingMinutes} 分钟</span>
              </div>
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            </div>

            <img alt={post.title} className="mt-10 aspect-[2/1] w-full rounded-xl bg-muted object-cover shadow-[0_20px_55px_rgba(35,40,52,0.16)] dark:shadow-[0_20px_55px_rgba(0,0,0,0.42)] max-[760px]:mt-7 max-[760px]:aspect-[16/9] max-[760px]:shadow-[0_14px_36px_rgba(35,40,52,0.14)]" src={post.cover} />

            <article className="article-content mt-14 max-[760px]:mt-10">
              <ReactMarkdown rehypePlugins={[rehypeSlug]} remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
            </article>
          </div>
        </section>
      </main>
      <ArticleActions />
    </>
  )
}
