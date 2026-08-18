import Link from 'next/link'

import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card'
import { icons } from '@/components/ui/icons'
import { LazyImage } from '@/components/ui/lazy-image'
import { Separator } from '@/components/ui/separator'
import { formatPostDate } from '@/features/posts/format'
import type { PostPreview } from '@/features/posts/types'

export function PostCard({ post }: { post: PostPreview }) {
  return (
    <Card className="group relative grid grid-cols-[225px_minmax(0,1fr)] gap-8 rounded-none bg-transparent py-0 ring-0 max-[1100px]:grid-cols-[205px_minmax(0,1fr)] max-[1100px]:gap-7 max-[760px]:block max-[760px]:py-12 max-[760px]:pb-[46px]">
      <Separator className="absolute inset-x-0 top-0" />
      <Link className="aspect-[1.4] overflow-hidden rounded-[10px] bg-muted shadow-[0_13px_30px_rgba(35,40,52,0.1)] max-[760px]:mb-[25px] max-[760px]:aspect-[1.45] max-[760px]:w-full max-[760px]:rounded-[9px] dark:shadow-[0_13px_30px_rgba(0,0,0,0.28)]" href={`/posts/${post.slug}`}>
        <LazyImage alt="" className="size-full object-cover transition-transform duration-450 group-hover:scale-[1.025] motion-reduce:transition-none" src={post.cover} />
      </Link>
      <CardContent className="flex min-w-0 flex-col px-0">
        <CardTitle className="mb-[13px] text-[23px] leading-[1.42] font-[680] tracking-[-0.025em] max-[760px]:mb-[15px] max-[760px]:leading-[1.48]"><Link className="article-title-link" href={`/posts/${post.slug}`}>{post.title}</Link></CardTitle>
        <CardDescription className="line-clamp-2 text-base leading-[1.85] text-muted-foreground max-[760px]:line-clamp-3 max-[760px]:text-[17px] max-[760px]:leading-[1.68]">{post.summary}</CardDescription>
        <CardFooter className="mt-auto border-0 bg-transparent px-0 pt-[15px] pb-0 max-[760px]:pt-5">
          <div className="flex flex-wrap items-center gap-[17px] text-[13px] text-muted-foreground/70 max-[760px]:gap-3.5 max-[760px]:text-xs">
            <Link className="transition-colors hover:text-foreground" href={`/weekly/${encodeURIComponent(post.tags[0])}`}>{post.tags[0]}</Link>
            <span className="inline-flex items-center gap-[5px]">{icons.clock} 约 {post.readingMinutes} 分钟</span>
            <time>{formatPostDate(post.date)}</time>
          </div>
        </CardFooter>
      </CardContent>
    </Card>
  )
}
