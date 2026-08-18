import Link from 'next/link'
import type { ReactNode } from 'react'

import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { icons } from '@/components/ui/icons'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'

type DesktopSidebarProps = {
  children: ReactNode
  className?: string
  profile?: 'full' | 'compact'
}

export function DesktopSidebar({ children, className, profile = 'full' }: DesktopSidebarProps) {
  return (
    <aside className={cn('sticky top-0 flex h-screen min-w-0 flex-col py-[26px] pr-2.5 pb-7 pl-[151px] max-[1100px]:pr-3 max-[1100px]:pl-14 max-[760px]:hidden', className)}>
      <ThemeToggle className="-ml-2 size-10 self-start p-2" />

      <div className="mt-[clamp(114px,13vh,146px)]">
        <Link aria-label="返回首页" href="/">
          <Avatar className="size-24 bg-[#283041] shadow-[0_15px_38px_rgba(32,39,55,0.14)] after:hidden dark:shadow-[0_15px_38px_rgba(0,0,0,0.3)]">
            <AvatarImage alt={`${siteConfig.name} 的头像`} src={siteConfig.avatar} />
          </Avatar>
        </Link>
        <Link className="mt-[31px] block text-4xl leading-[1.1] font-[750] tracking-[-0.045em]" href="/">{siteConfig.name}</Link>

        {profile === 'full' && (
          <>
            <p className="mt-[13px] text-lg leading-[1.8] text-muted-foreground">{siteConfig.description}</p>
            <div aria-label="社交链接" className="mt-[27px] flex gap-5 text-muted-foreground/75">
              <a aria-label="GitHub" className="transition-[color,transform] duration-200 hover:-translate-y-0.5 hover:text-foreground" href={siteConfig.social.github} rel="noreferrer" target="_blank">{icons.github}</a>
              <a aria-label="邮箱" className="transition-[color,transform] duration-200 hover:-translate-y-0.5 hover:text-foreground" href={`mailto:${siteConfig.social.email}`}>{icons.mail}</a>
              <span aria-label={`微信：${siteConfig.social.wechat}`} className="cursor-help transition-[color,transform] duration-200 hover:-translate-y-0.5 hover:text-foreground" title={`微信：${siteConfig.social.wechat}`}>{icons.wechat}</span>
            </div>
          </>
        )}
      </div>

      {children}
    </aside>
  )
}
