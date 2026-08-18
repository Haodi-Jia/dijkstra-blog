import type { ReactNode } from 'react'

const iconSizes = {
  17: 'size-[17px]',
  24: 'size-6',
  26: 'size-[26px]',
  27: 'size-[27px]',
  28: 'size-7',
  30: 'size-[30px]'
} as const

function Icon({ children, size = 24 }: { children: ReactNode; size?: keyof typeof iconSizes }) {
  return <svg aria-hidden="true" className={`${iconSizes[size]} block stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.8]`} fill="none" viewBox="0 0 24 24">{children}</svg>
}

export const icons = {
  home: <Icon><path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></Icon>,
  note: <Icon><path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M8 8h8M8 12h8M8 16h5" /></Icon>,
  camera: <Icon><path d="M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" /><circle cx="12" cy="13" r="4" /></Icon>,
  code: <Icon><path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 6l-4 12" /></Icon>,
  user: <Icon><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Icon>,
  search: <Icon size={30}><circle cx="10.8" cy="10.8" r="7.3" /><path d="m16.2 16.2 4.8 4.8" /></Icon>,
  menu: <Icon size={28}><path d="M4 6h16M4 12h16M4 18h16" /></Icon>,
  close: <Icon size={28}><path d="m6 6 12 12M18 6 6 18" /></Icon>,
  moon: <Icon size={26}><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" /><path d="M17 3v4M15 5h4" /></Icon>,
  sun: <Icon size={26}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Icon>,
  github: <Icon><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7A5.5 5.5 0 0 0 19.3 3 5.2 5.2 0 0 0 19.1.5S18 0 15 2a15.4 15.4 0 0 0-8 0C4-.1 2.9.5 2.9.5A5.2 5.2 0 0 0 2.7 3a5.5 5.5 0 0 0-1.5 4.5c0 5.4 3.5 6.6 6.8 7A4.8 4.8 0 0 0 7 18v4M7 19c-3 .9-3-1.5-4-2" /></Icon>,
  mail: <Icon><rect height="15" rx="2" width="20" x="2" y="4.5" /><path d="m3 6 9 7 9-7" /></Icon>,
  wechat: <Icon><path d="M15.5 15.5c3 0 5.5-1.9 5.5-4.3S18.5 7 15.5 7 10 8.9 10 11.2c0 .8.3 1.6.9 2.2L10.3 16l2.6-1a7 7 0 0 0 2.6.5Z" /><path d="M10.5 4C6.4 4 3 6.6 3 9.8c0 1.2.5 2.3 1.3 3.2l-.8 3.3 3.5-1.4c.7.3 1.5.5 2.3.6" /><circle cx="13.7" cy="10.7" fill="currentColor" r=".6" /><circle cx="17.6" cy="10.7" fill="currentColor" r=".6" /></Icon>,
  clock: <Icon size={17}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>,
  articles: <Icon size={27}><rect height="18" rx="1.5" width="16" x="4" y="3" /><path d="M8 7h4v4H8zM15 7h1M15 10h1M8 15h8M8 18h8" /></Icon>,
  archive: <Icon><path d="M4 7v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7M3 3h18v4H3zM9 11h6" /></Icon>,
  cards: <Icon><rect height="7" rx="1" width="8" x="3" y="3" /><rect height="7" rx="1" width="8" x="13" y="3" /><rect height="7" rx="1" width="8" x="3" y="14" /><rect height="7" rx="1" width="8" x="13" y="14" /></Icon>
} as const
