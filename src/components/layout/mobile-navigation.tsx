import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { icons } from '@/components/ui/icons'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { navigation, siteConfig } from '@/config/site'

export function MobileNavigation({ activeHref = '/' }: { activeHref?: string | null }) {
  return (
    <header className="sticky top-0 z-20 hidden h-16 grid-cols-[38px_38px_minmax(0,1fr)_40px_40px] items-center gap-2.5 border-b bg-background/96 px-4 backdrop-blur-[14px] max-[760px]:grid max-[380px]:grid-cols-[34px_34px_minmax(0,1fr)_36px_36px] max-[380px]:gap-[7px] max-[380px]:px-3">
      <Sheet>
        <SheetTrigger render={<Button aria-label="打开导航" className="size-[38px] p-[5px] max-[380px]:size-[34px]" size="icon" variant="ghost" />}>
          {icons.menu}
        </SheetTrigger>
        <SheetContent className="border-0 bg-popover px-[26px] py-6 shadow-[16px_0_50px_rgba(20,25,35,0.12)] data-[side=left]:w-[min(78vw,320px)] data-[side=left]:sm:max-w-[320px] dark:shadow-[16px_0_50px_rgba(0,0,0,0.35)]" side="left">
          <SheetTitle className="sr-only">主导航</SheetTitle>
          <nav aria-label="移动端导航" className="mt-[72px] grid gap-[7px]">
            {navigation.map((item) => (
              <Button
                className="h-auto justify-start gap-[15px] rounded-lg px-4 py-[13px] text-[17px] font-normal text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:border-transparent focus-visible:ring-0 data-[active=true]:bg-muted data-[active=true]:font-[650] data-[active=true]:text-foreground"
                data-active={item.href === activeHref}
                key={item.label}
                nativeButton={false}
                render={<a href={item.href} />}
                variant="ghost"
              >
                {icons[item.icon]}
                <span>{item.label}</span>
              </Button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <Avatar className="size-9 bg-[#283041] after:hidden">
        <AvatarImage alt="" src={siteConfig.avatar} />
      </Avatar>
      <span className="truncate text-[22px] leading-none font-[750] tracking-[-0.035em] max-[380px]:text-xl">{siteConfig.name}</span>
      <Button aria-label="搜索文章" className="size-10 p-[7px] text-muted-foreground max-[380px]:size-9" size="icon" variant="ghost">{icons.search}</Button>
      <ThemeToggle className="size-10 p-[7px] max-[380px]:size-9" />
    </header>
  )
}
