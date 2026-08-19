import Link from 'next/link'

import { PageContent } from '@/components/layout/page-content'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { icons } from '@/components/ui/icons'
import { content } from '@/content'
import { formatPostDate } from '@/features/posts/format'
import type { PostPreview } from '@/features/posts/types'

export function FeaturedPost({ post }: { post: PostPreview }) {
  const { minutes, readingTimePrefix } = content.posts.labels

  return (
    <PageContent>
      <Card className="gap-0 rounded-none bg-transparent py-[25px] pb-9 ring-0 max-[760px]:py-14 max-[760px]:pb-[47px]">
        <CardContent className="px-0">
          <CardTitle className="text-[clamp(26px,1.8vw,30px)] leading-[1.42] font-bold tracking-[-0.025em] max-[760px]:text-[25px] max-[760px]:leading-[1.48] max-[760px]:tracking-[-0.02em]"><Link className="article-title-link" href={`/posts/${post.slug}`}>{post.title}</Link></CardTitle>
          <CardDescription className="mt-2.5 mb-[18px] max-w-[1000px] text-lg leading-[1.55] font-normal text-muted-foreground max-[760px]:mt-[22px] max-[760px]:mb-[21px] max-[760px]:line-clamp-3 max-[760px]:leading-[1.65]">{post.summary}</CardDescription>
          <div className="flex flex-wrap items-center gap-[17px] text-[13px] text-muted-foreground/70 max-[760px]:gap-3.5 max-[760px]:text-xs">
            <Link className="transition-colors hover:text-foreground" href={`/weekly/${encodeURIComponent(post.tags[0])}`}>{post.tags[0]}</Link>
            <span className="inline-flex items-center gap-[5px]">{icons.clock} {readingTimePrefix} {post.readingMinutes} {minutes}</span>
            <time>{formatPostDate(post.date)}</time>
          </div>
        </CardContent>
      </Card>
    </PageContent>
  )
}
