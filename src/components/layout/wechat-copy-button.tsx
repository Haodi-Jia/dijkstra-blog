'use client'

import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { icons } from '@/components/ui/icons'
import { content } from '@/content'

export function WechatCopyButton({ wechat }: { wechat: string }) {
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(resetTimer.current), [])

  async function copyWechat() {
    await navigator.clipboard.writeText(wechat)
    setCopied(true)
    clearTimeout(resetTimer.current)
    resetTimer.current = setTimeout(() => setCopied(false), 1500)
  }

  const label = copied ? content.site.labels.wechatCopied : `${content.site.labels.copyWechat}：${wechat}`

  return (
    <Button
      aria-label={label}
      className="size-6 rounded-none p-0 transition-[color,transform] duration-200 hover:-translate-y-0.5 hover:bg-transparent hover:text-foreground"
      onClick={copyWechat}
      size="icon-xs"
      title={label}
      variant="ghost"
    >
      {copied ? icons.check : icons.wechat}
    </Button>
  )
}
