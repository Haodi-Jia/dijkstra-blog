export const siteConfig = {
  name: 'Dijkstra',
  avatar: '/icon.jpg',
  social: {
    github: 'https://github.com/Haodi-Jia',
    email: 'haodijia703@gmail.com',
    wechat: 'haodijia703'
  }
} as const

export const navigation = [
  { key: 'home', icon: 'home', href: '/' },
  { key: 'gallery', icon: 'camera', href: '/gallery' },
  { key: 'weekly', icon: 'note', href: '/weekly' },
  { key: 'projects', icon: 'code', href: '/projects' },
  { key: 'about', icon: 'user', href: '/about' }
] as const
