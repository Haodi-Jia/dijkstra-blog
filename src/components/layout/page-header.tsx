import type { ReactNode } from 'react'

import { SearchButton } from '@/components/layout/search-button'
import { icons } from '@/components/ui/icons'
import { content } from '@/content'
import { cn } from '@/lib/utils'

type PageHeaderProps = {
  action?: ReactNode
  icon?: ReactNode
  large?: boolean
  searchLabel?: string
  title: string
}

export function PageHeader({ action, icon = icons.articles, large = false, searchLabel = content.site.labels.searchArticles, title }: PageHeaderProps) {
  return (
    <header className="flex min-h-[42px] max-w-[1098px] items-center justify-between max-[760px]:min-h-[29px]">
      <div className="flex items-center gap-[18px] max-[760px]:gap-0">
        <SearchButton label={searchLabel} />
        <h1 className={cn(
          'flex items-center gap-3 text-xl font-[650] max-[760px]:gap-2.5 max-[760px]:text-lg max-[760px]:[&_svg]:size-[21px]',
          large && 'text-[28px] leading-none font-[720] tracking-[-0.035em] max-[760px]:text-2xl'
        )}>
          {icon}
          <span>{title}</span>
        </h1>
      </div>
      {action}
    </header>
  )
}
