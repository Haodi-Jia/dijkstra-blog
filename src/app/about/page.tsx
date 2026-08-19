import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { Metadata } from 'next'

import { PageContent } from '@/components/layout/page-content'
import { PageHeader } from '@/components/layout/page-header'
import { PageShell } from '@/components/layout/page-shell'
import { MarkdownContent } from '@/components/ui/markdown-content'
import { content } from '@/content'

const title = content.site.navigation.about

export const metadata: Metadata = { title }

export default function AboutPage() {
  const source = readFileSync(join(process.cwd(), 'public', 'about.md'), 'utf8')

  return (
    <PageShell activeHref="/about">
      <PageHeader icon={null} large title={title} />

      <PageContent as="article" className="article-content max-w-[960px] pt-[128px] max-[1100px]:pt-[112px] max-[760px]:pt-14 [&>h2:first-child]:mt-0">
        <MarkdownContent source={source} />
      </PageContent>
    </PageShell>
  )
}
