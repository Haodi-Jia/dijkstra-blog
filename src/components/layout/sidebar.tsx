import { DesktopSidebar } from '@/components/layout/desktop-sidebar'
import { Button } from '@/components/ui/button'
import { icons } from '@/components/ui/icons'
import { content } from '@/content'
import { navigation } from '@/config/site'

export function Sidebar({ activeHref = '/' }: { activeHref?: string | null }) {
  return (
    <DesktopSidebar>
      <nav aria-label={content.site.labels.mainNavigation} className="mt-[clamp(46px,7vh,70px)] grid gap-[5px]">
        {navigation.map((item) => (
          <Button
            className="h-auto w-[190px] justify-start gap-[15px] rounded-lg py-[11px] pr-[14px] pl-0 text-lg font-normal text-muted-foreground hover:bg-muted hover:text-foreground data-[active=true]:font-[650] data-[active=true]:text-foreground"
            data-active={item.href === activeHref}
            key={item.key}
            nativeButton={false}
            render={<a href={item.href} />}
            variant="ghost"
          >
            {icons[item.icon]}
            <span>{content.site.navigation[item.key]}</span>
          </Button>
        ))}
      </nav>
      <p className="mt-auto text-xs tracking-[0.05em] text-muted-foreground/60">{content.site.copyright}</p>
    </DesktopSidebar>
  )
}
