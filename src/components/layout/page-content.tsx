import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type PageContentProps = HTMLAttributes<HTMLElement> & {
  as?: 'article' | 'div' | 'nav'
  children: ReactNode
}

export function PageContent({ as: Component = 'div', children, className, ...props }: PageContentProps) {
  return (
    <Component
      className={cn('mx-[58px] max-w-[1040px] max-[1100px]:mx-[38px] max-[760px]:mx-0', className)}
      {...props}
    >
      {children}
    </Component>
  )
}
