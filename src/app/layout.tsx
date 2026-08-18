import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import './globals.css'

export const metadata: Metadata = {
  title: 'Dijkstra · 个人博客',
  description: '科技向善',
  icons: {
    icon: '/icon.jpg',
    apple: '/icon.jpg'
  }
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `const theme=localStorage.getItem('theme');const dark=theme==='dark'||(theme===null&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',dark)` }} />
      </head>
      <body className="font-['PingFang_SC','Hiragino_Sans_GB','Microsoft_YaHei',Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]">
        {children}
      </body>
    </html>
  )
}
