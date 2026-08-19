import { PageShell } from '@/components/layout/page-shell'
import { HomePostFeed } from '@/features/posts/components/home-post-feed'
import { readPosts } from '@/features/posts/read-posts'

export default function Home() {
  const posts = readPosts().map(({ content, ...post }) => post)

  return (
    <PageShell>
      <HomePostFeed posts={posts} />
    </PageShell>
  )
}
