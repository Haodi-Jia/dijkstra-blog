import { HomePostFeed } from '@/components/blog/home-post-feed'
import { PageShell } from '@/components/layout/page-shell'
import { readPosts } from '@/features/posts/read-posts'

export default function Home() {
  const posts = readPosts().map(({ content, ...post }) => post)

  return (
    <PageShell>
      <HomePostFeed posts={posts} />
    </PageShell>
  )
}
