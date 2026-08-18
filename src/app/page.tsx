import { FeaturedPost } from '@/components/blog/featured-post'
import { PostCard } from '@/components/blog/post-card'
import { PageHeader } from '@/components/layout/page-header'
import { PageShell } from '@/components/layout/page-shell'
import { readPosts } from '@/features/posts/read-posts'

export default function Home() {
  const [latest, ...posts] = readPosts()

  return (
    <PageShell>
      <PageHeader title="最新文章" />
      <FeaturedPost post={latest} />
      <div className="ml-[58px] max-w-[1040px] space-y-12 max-[1100px]:ml-[38px] max-[760px]:ml-0 max-[760px]:space-y-0">
        {posts.map((post, index) => <PostCard eager={index < 2} key={post.slug} post={post} />)}
      </div>
    </PageShell>
  )
}
