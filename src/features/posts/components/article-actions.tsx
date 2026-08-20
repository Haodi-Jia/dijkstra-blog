'use client'

import { ArrowLeft, ChevronUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { content } from '@/content'

export function ArticleActions() {
  const router = useRouter()
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    function updateScrollTopVisibility() {
      setShowScrollTop(window.scrollY > 480)
    }

    updateScrollTopVisibility()
    window.addEventListener('scroll', updateScrollTopVisibility, { passive: true })
    return () => window.removeEventListener('scroll', updateScrollTopVisibility)
  }, [])

  return (
    <div className="fixed right-7 bottom-7 z-30 flex flex-col gap-3 max-[760px]:right-4 max-[760px]:bottom-24">
      <Button aria-label={content.posts.labels.back} className="size-12 rounded-full shadow-[0_10px_28px_rgba(35,40,52,0.22)] dark:shadow-[0_10px_28px_rgba(0,0,0,0.45)]" onClick={() => router.back()} size="icon">
        <ArrowLeft className="size-5" />
      </Button>
      {showScrollTop && (
        <Button aria-label={content.posts.labels.scrollTop} className="size-12 rounded-full shadow-[0_10px_28px_rgba(35,40,52,0.22)] dark:shadow-[0_10px_28px_rgba(0,0,0,0.45)]" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} size="icon">
          <ChevronUp className="size-5" />
        </Button>
      )}
    </div>
  )
}
