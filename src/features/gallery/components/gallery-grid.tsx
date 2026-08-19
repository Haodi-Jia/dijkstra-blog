'use client'

import { useState } from 'react'

import { PageContent } from '@/components/layout/page-content'
import { Button } from '@/components/ui/button'
import { LazyImage } from '@/components/ui/lazy-image'
import type { GalleryPhoto } from '@/features/gallery/types'

type GalleryGridProps = {
  allLabel: string
  categoriesLabel: string
  photos: readonly GalleryPhoto[]
}

export function GalleryGrid({ allLabel, categoriesLabel, photos }: GalleryGridProps) {
  const categories = [allLabel, ...new Set(photos.map((photo) => photo.category))]
  const [activeCategory, setActiveCategory] = useState(allLabel)
  const visiblePhotos = activeCategory === allLabel
    ? photos
    : photos.filter((photo) => photo.category === activeCategory)

  return (
    <PageContent className="mt-[58px] max-[760px]:mt-8">
      <div aria-label={categoriesLabel} className="flex flex-wrap gap-3 max-[760px]:gap-2">
        {categories.map((category) => {
          const count = category === allLabel
            ? photos.length
            : photos.filter((photo) => photo.category === category).length

          return (
            <Button
              aria-pressed={activeCategory === category}
              className="h-10 rounded-xl px-4 text-[15px] font-medium text-muted-foreground hover:text-foreground data-[active=true]:bg-foreground data-[active=true]:text-background max-[760px]:h-9 max-[760px]:px-3"
              data-active={activeCategory === category}
              key={category}
              onClick={() => setActiveCategory(category)}
              variant="ghost"
            >
              <span>{category}</span>
              <span className="rounded-full border border-current/15 px-2 py-0.5 text-xs leading-none opacity-70">{count}</span>
            </Button>
          )
        })}
      </div>

      <div className="mt-8 grid grid-cols-3 items-start gap-3 max-[1100px]:grid-cols-2 max-[760px]:mt-6 max-[760px]:grid-cols-1 max-[760px]:gap-4">
        {visiblePhotos.map((photo) => (
          <figure
            className="group overflow-hidden rounded-xl bg-muted ring-1 ring-black/[0.035] dark:ring-white/[0.06]"
            key={photo.src}
          >
            <LazyImage
              alt={photo.alt}
              className="h-auto w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.015] motion-reduce:transition-none"
              height={photo.height}
              src={photo.src}
              width={photo.width}
            />
          </figure>
        ))}
      </div>
    </PageContent>
  )
}
