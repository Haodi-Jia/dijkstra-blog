import type { Metadata } from 'next'

import { PageHeader } from '@/components/layout/page-header'
import { PageShell } from '@/components/layout/page-shell'
import { icons } from '@/components/ui/icons'
import { content } from '@/content'
import { GalleryGrid } from '@/features/gallery/components/gallery-grid'

export const metadata: Metadata = {
  title: content.gallery.metadata.title,
  description: content.gallery.metadata.description
}

export default function GalleryPage() {
  const { labels, photos, title } = content.gallery

  return (
    <PageShell activeHref="/gallery">
      <PageHeader icon={icons.camera} searchLabel={labels.search} title={title} />
      <GalleryGrid allLabel={labels.all} categoriesLabel={labels.categories} photos={photos} />
    </PageShell>
  )
}
