import type { ReactNode } from 'react'

import { MobileNavigation } from '@/components/layout/mobile-navigation'
import { Sidebar } from '@/components/layout/sidebar'

export function PageShell({ activeHref = '/', children }: { activeHref?: string; children: ReactNode }) {
  return (
    <>
      <MobileNavigation activeHref={activeHref} />
      <main className="mx-auto grid min-h-screen w-[min(1480px,calc(100%-64px))] grid-cols-[300px_minmax(0,1fr)] max-[1100px]:w-[calc(100%-40px)] max-[1100px]:grid-cols-[270px_minmax(0,1fr)] max-[760px]:block max-[760px]:min-h-0 max-[760px]:w-full">
        <Sidebar activeHref={activeHref} />
        <section className="min-w-0 px-[135px] pt-[23px] pb-[100px] max-[1100px]:px-10 max-[760px]:px-[18px] max-[760px]:pt-14 max-[760px]:pb-[70px] max-[380px]:px-4">
          {children}
        </section>
      </main>
    </>
  )
}
