export const siteConfig = {
  name: 'Dijkstra',
  description: '科技向善',
  copyright: '© 2026 Dijkstra',
  avatar: '/icon.jpg',
  social: {
    github: 'https://github.com/Haodi-Jia',
    email: 'haodijia703@gmail.com',
    wechat: 'haodijia703'
  }
} as const

export const navigation = [
  { label: '首页', icon: 'home', href: '/' },
  { label: '影集', icon: 'camera', href: '#' },
  { label: '三七周刊', icon: 'note', href: '/weekly' },
  { label: '开源项目', icon: 'code', href: '#' },
  { label: '关于我', icon: 'user', href: '/about' }
] as const
