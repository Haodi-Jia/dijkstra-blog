import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { icons } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

export function PageHeader({ action, articleIcon = true, large = false, title }: { action?: ReactNode; articleIcon?: boolean; large?: boolean; title: string }) {
  return (
    <header className="flex min-h-[42px] max-w-[1098px] items-center justify-between max-[760px]:min-h-[29px]">
      <div className="flex items-center gap-[18px] max-[760px]:gap-0">
        <Button aria-label="搜索文章" className="size-10 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground max-[760px]:hidden" size="icon" variant="ghost">{icons.search}</Button>
        <h1 className={cn(
          'flex items-center gap-3 text-xl font-[650] max-[760px]:gap-2.5 max-[760px]:text-lg max-[760px]:[&_svg]:size-[21px]',
          large && 'text-[28px] leading-none font-[720] tracking-[-0.035em] max-[760px]:text-2xl'
        )}>
          {articleIcon && icons.articles}
          <span>{title}</span>
        </h1>
      </div>
      {action}
    </header>
  )
}
