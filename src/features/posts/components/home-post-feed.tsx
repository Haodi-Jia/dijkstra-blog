'use client'

import Link from 'next/link'
import { useState } from 'react'

import { PageContent } from '@/components/layout/page-content'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { icons } from '@/components/ui/icons'
import { content } from '@/content'
import { FeaturedPost } from '@/features/posts/components/featured-post'
import { PostCard } from '@/features/posts/components/post-card'
import { formatPostDate } from '@/features/posts/format'
import type { PostPreview } from '@/features/posts/types'

function ArchiveView({ posts }: { posts: PostPreview[] }) {
  const groups = posts.reduce((result, post) => {
    const year = post.date.slice(0, 4)
    result.set(year, [...(result.get(year) ?? []), post])
    return result
  }, new Map<string, PostPreview[]>())

  return (
    <PageContent className="pt-12 max-[760px]:pt-10">
      {[...groups].map(([year, yearPosts]) => (
        <section className="mb-12 last:mb-0 max-[760px]:mb-10" key={year}>
          <h2 className="mb-6 text-lg font-normal text-muted-foreground/70 max-[760px]:mb-5 max-[760px]:text-base">{year}</h2>
          <div className="space-y-5 max-[760px]:space-y-5">
            {yearPosts.map((post) => (
              <article key={post.slug}>
                <Link className="article-title-link text-[18px] leading-[1.45] font-[650] tracking-[-0.015em] max-[760px]:text-base" href={`/posts/${post.slug}`}>
                  {post.title}
                </Link>
                <time className="mt-1.5 block text-[13px] text-muted-foreground/55 max-[760px]:text-xs">{formatPostDate(post.date)}</time>
              </article>
            ))}
          </div>
        </section>
      ))}
    </PageContent>
  )
}

export function HomePostFeed({ posts }: { posts: PostPreview[] }) {
  const [archived, setArchived] = useState(false)
  const [latest, ...rest] = posts
  const label = archived ? content.home.cardViewLabel : content.home.archiveViewLabel

  return (
    <>
      <PageHeader
        action={(
          <Button
            aria-label={label}
            aria-pressed={archived}
            className="size-10 rounded-full text-muted-foreground hover:text-foreground max-[760px]:size-9 [&_svg]:size-[22px]"
            onClick={() => setArchived((current) => !current)}
            size="icon"
            title={label}
            variant="ghost"
          >
            {archived ? icons.cards : icons.archive}
          </Button>
        )}
        title={content.home.title}
      />

      {archived ? (
        <ArchiveView posts={posts} />
      ) : (
        <>
          <FeaturedPost post={latest} />
          <PageContent className="space-y-12 max-[760px]:space-y-0">
            {rest.map((post) => <PostCard key={post.slug} post={post} />)}
          </PageContent>
        </>
      )}
    </>
  )
}
