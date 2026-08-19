'use client'

import { useEffect, useState } from 'react'

import { DesktopSidebar } from '@/components/layout/desktop-sidebar'
import { content } from '@/content'
import type { PostHeading } from '@/features/posts/read-headings'

type HeadingGroup = {
  heading: PostHeading
  children: PostHeading[]
}

export function ArticleSidebar({ headings }: { headings: PostHeading[] }) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? '')
  const rootLevel = Math.min(...headings.map((heading) => heading.level))
  const headingGroups = headings.reduce<HeadingGroup[]>((groups, heading) => {
    if (heading.level === rootLevel) {
      groups.push({ heading, children: [] })
    } else {
      groups.at(-1)?.children.push(heading)
    }

    return groups
  }, [])

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
    <DesktopSidebar className="pr-5 max-[1200px]:pl-14" profile="compact">
      <nav aria-label={content.posts.labels.contents} className="mt-10 min-h-0 w-[290px] overflow-y-auto pr-2 pb-8">
        <p className="mb-4 text-lg text-muted-foreground">{content.posts.labels.contents}</p>
        <div className="grid gap-3 text-[15px] leading-6 text-muted-foreground">
          {headingGroups.map(({ heading, children }) => (
            <div className="grid gap-1" key={heading.id}>
              <a
                className="rounded-md px-3 py-1.5 break-words transition-colors hover:bg-muted hover:text-foreground data-[selected=true]:bg-muted data-[selected=true]:font-[650] data-[selected=true]:text-foreground"
                data-selected={activeId === heading.id}
                href={`#${encodeURIComponent(heading.id)}`}
              >
                {heading.text}
              </a>

              {children.length > 0 && (
                <div className="ml-3 grid gap-1 border-l border-border pl-3">
                  {children.map((child) => (
                    <a
                      className="rounded-md px-3 py-1.5 break-words transition-colors hover:bg-muted hover:text-foreground data-[level=4]:pl-6 data-[selected=true]:bg-muted data-[selected=true]:font-[650] data-[selected=true]:text-foreground"
                      data-level={child.level}
                      data-selected={activeId === child.id}
                      href={`#${encodeURIComponent(child.id)}`}
                      key={child.id}
                    >
                      {child.text}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>
    </DesktopSidebar>
  )
}
