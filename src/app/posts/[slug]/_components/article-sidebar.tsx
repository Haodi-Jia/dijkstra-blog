'use client'

import { useEffect, useState } from 'react'

import { DesktopSidebar } from '@/components/layout/desktop-sidebar'
import type { PostHeading } from '@/features/posts/read-headings'

export function ArticleSidebar({ headings }: { headings: PostHeading[] }) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? '')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleHeading = entries.find((entry) => entry.isIntersecting)
        if (visibleHeading) setActiveId(visibleHeading.target.id)
      },
      { rootMargin: '-12% 0px -75% 0px' }
    )

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headings])

  return (
    <DesktopSidebar className="pr-5" profile="compact">
      <nav aria-label="文章目录" className="mt-10 min-h-0 overflow-y-auto pr-2 pb-8">
        <p className="mb-4 text-lg text-muted-foreground">文章目录</p>
        <div className="grid gap-1 text-[15px] leading-6 text-muted-foreground">
          {headings.map((heading) => (
            <a
              className="rounded-md px-3 py-1.5 break-words transition-colors hover:bg-muted hover:text-foreground data-[level=3]:pl-6 data-[level=4]:pl-9 data-[selected=true]:bg-muted data-[selected=true]:font-[650] data-[selected=true]:text-foreground"
              data-level={heading.level}
              data-selected={activeId === heading.id}
              href={`#${encodeURIComponent(heading.id)}`}
              key={heading.id}
            >
              {heading.text}
            </a>
          ))}
        </div>
      </nav>
    </DesktopSidebar>
  )
}
