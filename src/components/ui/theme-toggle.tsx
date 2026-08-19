'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { icons } from '@/components/ui/icons'
import { content } from '@/content'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggleTheme() {
    const nextDark = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', nextDark)
    localStorage.setItem('theme', nextDark ? 'dark' : 'light')
    setDark(nextDark)
  }

  const label = dark ? content.site.labels.lightTheme : content.site.labels.darkTheme

  return (
    <Button
      aria-label={label}
      className={cn('text-muted-foreground', className)}
      onClick={toggleTheme}
      size="icon"
      title={label}
      variant="ghost"
    >
      {dark ? icons.sun : icons.moon}
    </Button>
  )
}
