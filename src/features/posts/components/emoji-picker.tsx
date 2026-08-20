'use client'

import { Search, Smile } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const categories = [
  { id: 'recent', icon: '⊕', label: '最近使用' },
  { id: 'smileys', icon: '😀', label: '表情与角色' },
  { id: 'animals', icon: '🐶', label: '动物与自然' },
  { id: 'food', icon: '🍎', label: '食物与饮料' },
  { id: 'activities', icon: '⚽', label: '活动' },
  { id: 'travel', icon: '🚗', label: '旅行与地点' },
  { id: 'objects', icon: '💡', label: '物品' },
  { id: 'symbols', icon: '🎵', label: '符号' },
  { id: 'flags', icon: '🏁', label: '旗帜' }
] as const

const emojiGroups: Record<string, Array<[string, string]>> = {
  smileys: [
    ['😀', '开心 笑脸'], ['😃', '大笑 开心'], ['😄', '微笑'], ['😁', '露齿笑'], ['😆', '眯眼笑'], ['😅', '流汗笑'], ['🤣', '笑哭'], ['😂', '喜极而泣'], ['🙂', '微笑'],
    ['🙃', '倒脸'], ['😉', '眨眼'], ['😊', '害羞'], ['😇', '天使'], ['🥰', '喜爱'], ['😍', '爱心眼'], ['🤩', '星星眼'], ['😘', '飞吻'], ['😗', '亲亲'],
    ['😚', '闭眼亲'], ['😋', '美味'], ['😛', '吐舌'], ['😜', '调皮'], ['🤪', '搞怪'], ['😎', '墨镜'], ['🥳', '庆祝'], ['😏', '得意'], ['😌', '轻松'],
    ['😔', '伤心'], ['😢', '哭泣'], ['😭', '大哭'], ['😤', '生气'], ['😡', '愤怒'], ['🤔', '思考'], ['🤫', '安静'], ['🤭', '捂嘴'], ['😱', '惊恐'],
    ['👍', '点赞'], ['👎', '反对'], ['👏', '鼓掌'], ['🙏', '感谢'], ['💪', '加油'], ['🤝', '握手'], ['👀', '眼睛'], ['❤️', '爱心'], ['💯', '满分']
  ],
  animals: [['🐶', '狗'], ['🐱', '猫'], ['🐭', '老鼠'], ['🐹', '仓鼠'], ['🐰', '兔子'], ['🦊', '狐狸'], ['🐻', '熊'], ['🐼', '熊猫'], ['🐨', '考拉'], ['🐯', '老虎'], ['🦁', '狮子'], ['🐮', '牛'], ['🐷', '猪'], ['🐸', '青蛙'], ['🐵', '猴子'], ['🌸', '花'], ['🌻', '向日葵'], ['🌙', '月亮']],
  food: [['🍎', '苹果'], ['🍊', '橘子'], ['🍋', '柠檬'], ['🍉', '西瓜'], ['🍇', '葡萄'], ['🍓', '草莓'], ['🍒', '樱桃'], ['🍑', '桃子'], ['🥭', '芒果'], ['🍞', '面包'], ['🍔', '汉堡'], ['🍟', '薯条'], ['🍕', '披萨'], ['🍜', '面条'], ['🍣', '寿司'], ['🍰', '蛋糕'], ['☕', '咖啡'], ['🍻', '干杯']],
  activities: [['⚽', '足球'], ['🏀', '篮球'], ['🏈', '橄榄球'], ['⚾', '棒球'], ['🎾', '网球'], ['🏓', '乒乓球'], ['🏸', '羽毛球'], ['🎯', '目标'], ['🎮', '游戏'], ['🎨', '画画'], ['🎬', '电影'], ['🎤', '唱歌'], ['🎧', '耳机'], ['🎉', '庆祝'], ['🎊', '彩带'], ['🏆', '奖杯'], ['🥇', '金牌'], ['🚀', '火箭']],
  travel: [['🚗', '汽车'], ['🚕', '出租车'], ['🚌', '公交车'], ['🚲', '自行车'], ['✈️', '飞机'], ['🚄', '高铁'], ['🚢', '轮船'], ['🏠', '房子'], ['🏢', '办公楼'], ['🏫', '学校'], ['⛰️', '山'], ['🏖️', '海滩'], ['🌇', '日落'], ['🌍', '地球'], ['🗺️', '地图'], ['⛺', '帐篷'], ['🌉', '桥'], ['🗼', '塔']],
  objects: [['💡', '灯泡 想法'], ['📱', '手机'], ['💻', '电脑'], ['⌨️', '键盘'], ['🖥️', '显示器'], ['📷', '相机'], ['🔋', '电池'], ['🔧', '工具'], ['🔒', '锁'], ['🔑', '钥匙'], ['📌', '图钉'], ['📎', '回形针'], ['✏️', '铅笔'], ['📝', '笔记'], ['📚', '书籍'], ['📦', '包裹'], ['🎁', '礼物'], ['⏰', '闹钟']],
  symbols: [['✅', '正确'], ['❌', '错误'], ['⚠️', '警告'], ['❓', '问题'], ['❗', '感叹'], ['➕', '加号'], ['➖', '减号'], ['➡️', '右箭头'], ['⬅️', '左箭头'], ['⬆️', '上箭头'], ['⬇️', '下箭头'], ['♻️', '循环'], ['✨', '闪光'], ['🔥', '火 热门'], ['⭐', '星星'], ['💬', '评论'], ['🔗', '链接'], ['🎵', '音乐']],
  flags: [['🏁', '终点旗'], ['🚩', '红旗'], ['🏳️', '白旗'], ['🏴', '黑旗'], ['🇨🇳', '中国'], ['🇭🇰', '香港'], ['🇯🇵', '日本'], ['🇰🇷', '韩国'], ['🇸🇬', '新加坡'], ['🇬🇧', '英国'], ['🇺🇸', '美国'], ['🇨🇦', '加拿大'], ['🇫🇷', '法国'], ['🇩🇪', '德国'], ['🇮🇹', '意大利'], ['🇪🇸', '西班牙'], ['🇦🇺', '澳大利亚'], ['🇳🇿', '新西兰']]
}

const recentStorageKey = 'dijkstra-blog-recent-emojis'

export function EmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  const [open, setOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('recent')
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState<string[]>([])
  const [preview, setPreview] = useState('😊')

  useEffect(() => {
    const saved = localStorage.getItem(recentStorageKey)
    if (saved) setRecent(JSON.parse(saved))
  }, [])

  const emojis = useMemo(() => {
    if (query.trim()) {
      const keyword = query.trim().toLocaleLowerCase()
      return Object.values(emojiGroups).flat().filter(([, label]) => label.toLocaleLowerCase().includes(keyword))
    }
    if (activeCategory === 'recent') {
      const recentSet = new Set(recent)
      const matches = Object.values(emojiGroups).flat().filter(([emoji]) => recentSet.has(emoji))
      return matches.length > 0 ? matches : emojiGroups.smileys.slice(0, 18)
    }
    return emojiGroups[activeCategory]
  }, [activeCategory, query, recent])

  function selectEmoji(emoji: string) {
    const nextRecent = [emoji, ...recent.filter((item) => item !== emoji)].slice(0, 18)
    setRecent(nextRecent)
    localStorage.setItem(recentStorageKey, JSON.stringify(nextRecent))
    onSelect(emoji)
    setPreview(emoji)
    setOpen(false)
  }

  const heading = query ? '搜索结果' : categories.find((category) => category.id === activeCategory)?.label

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        aria-label="插入表情"
        render={<Button className="size-10 rounded-lg text-muted-foreground" size="icon" title="表情" type="button" variant="ghost" />}
      >
        <Smile className="size-5" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[440px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border-border/70 p-0 shadow-[0_24px_65px_rgba(35,40,52,0.2)]" finalFocus={false} sideOffset={10}>
        <div className="flex items-center justify-between border-b px-3 pt-2">
          {categories.map((category) => (
            <button
              aria-label={category.label}
              className={cn('relative flex size-10 items-center justify-center rounded-lg text-xl opacity-60 transition hover:bg-muted hover:opacity-100', activeCategory === category.id && !query && 'opacity-100 after:absolute after:inset-x-1 after:-bottom-[1px] after:h-[3px] after:rounded-full after:bg-blue-600')}
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id)
                setQuery('')
              }}
              title={category.label}
              type="button"
            >
              {category.icon}
            </button>
          ))}
        </div>
        <div className="p-3 pb-0">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input className="h-11 border-0 bg-muted pl-10 shadow-none focus-visible:ring-0" onChange={(event) => setQuery(event.target.value)} placeholder="搜索表情" value={query} />
          </div>
        </div>
        <div className="h-[310px] overflow-y-auto px-3 py-3">
          <p className="mb-2 text-sm font-semibold">{heading}</p>
          <div className="grid grid-cols-9 gap-1 max-[520px]:grid-cols-8">
            {emojis.map(([emoji, label]) => (
              <button
                aria-label={label}
                className="flex aspect-square items-center justify-center rounded-lg text-[25px] transition hover:bg-muted active:scale-90"
                key={`${emoji}-${label}`}
                onClick={() => selectEmoji(emoji)}
                onMouseEnter={() => setPreview(emoji)}
                title={label}
                type="button"
              >
                {emoji}
              </button>
            ))}
          </div>
          {emojis.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">没有找到相关表情</p>}
        </div>
        <div className="flex h-16 items-center gap-3 border-t px-4">
          <span className="text-3xl">{preview}</span>
          <span className="text-sm text-muted-foreground">选择一个表情插入评论</span>
        </div>
      </PopoverContent>
    </Popover>
  )
}
