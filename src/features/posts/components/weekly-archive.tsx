import Link from 'next/link'

import { PageContent } from '@/components/layout/page-content'
import { PageHeader } from '@/components/layout/page-header'
import { PageShell } from '@/components/layout/page-shell'
import { content } from '@/content'
import { PostCard } from '@/features/posts/components/post-card'
import { readCategories, readPosts } from '@/features/posts/read-posts'
import { cn } from '@/lib/utils'

export const weeklyCategory = content.weekly.title

export function WeeklyArchive({ category }: { category: string }) {
  const categories = [weeklyCategory, ...readCategories().filter((item) => item !== weeklyCategory)]
  const posts = readPosts().filter((post) => post.tags.includes(category))

  return (
    <PageShell activeHref="/weekly">
      <PageHeader title={category} />

      <PageContent as="nav" aria-label={content.posts.labels.category} className="flex flex-wrap gap-x-3 gap-y-2 py-12 max-[760px]:py-8">
        {categories.map((item) => (
          <Link
            className={cn(
              'rounded-lg px-4 py-2 text-[15px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
              item === category && 'bg-foreground font-[650] text-background hover:bg-foreground hover:text-background'
            )}
            href={item === weeklyCategory ? '/weekly' : `/weekly/${encodeURIComponent(item)}`}
            key={item}
          >
            {item}
          </Link>
        ))}
      </PageContent>

      <PageContent className="space-y-12 max-[760px]:space-y-0">
        {posts.length > 0 ? posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        )) : (
          <div className="border-t py-16 text-center text-muted-foreground/70">{content.weekly.empty}</div>
        )}
      </PageContent>
    </PageShell>
  )
}
