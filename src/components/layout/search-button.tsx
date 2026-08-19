import { Button } from '@/components/ui/button'
import { icons } from '@/components/ui/icons'
import { content } from '@/content'
import { cn } from '@/lib/utils'

export function SearchButton({ className, label = content.site.labels.searchArticles }: { className?: string; label?: string }) {
  return (
    <Button
      aria-label={label}
      className={cn('size-10 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground max-[760px]:hidden', className)}
      size="icon"
      variant="ghost"
    >
      {icons.search}
    </Button>
  )
}
