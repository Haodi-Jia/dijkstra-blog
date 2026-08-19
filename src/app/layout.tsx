import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { i18nConfig } from '@/config/i18n'
import { siteConfig } from '@/config/site'
import { content } from '@/content'

import './globals.css'

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} · ${content.site.metadata.title}`,
    template: `%s · ${siteConfig.name}`
  },
  description: content.site.metadata.description,
  icons: {
    icon: '/icon.jpg',
    apple: '/icon.jpg'
  }
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang={i18nConfig.defaultLocale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `const theme=localStorage.getItem('theme');const dark=theme==='dark'||(theme===null&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',dark)` }} />
      </head>
      <body className="font-['PingFang_SC','Hiragino_Sans_GB','Microsoft_YaHei',Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]">
        {children}
      </body>
    </html>
  )
}
