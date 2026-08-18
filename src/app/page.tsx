import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ReactNode } from 'react'

type Post = { slug: string; title: string; date: string; summary: string; cover: string; tags: string[]; readingMinutes: number }

const socialProfiles = {
  github: 'https://github.com/your-name',
  email: 'your-email@example.com',
  wechat: '待填写'
}

function readPosts(): Post[] {
  const blogDirectory = join(process.cwd(), 'public', 'blogs')

  return readdirSync(blogDirectory)
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const source = readFileSync(join(blogDirectory, fileName), 'utf8')
      const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
      const field = (name: string) =>
        frontmatter.match(new RegExp(`^${name}:\\s*["']?(.*?)["']?$`, 'm'))?.[1] ?? ''
      const tagValue = field('tags')

      return {
        slug: fileName.replace(/\.md$/, ''),
        title: field('title'),
        date: field('date'),
        summary: field('summary'),
        cover: field('cover'),
        tags: [...tagValue.matchAll(/["']([^"']+)["']/g)].map((match) => match[1]),
        readingMinutes: Math.max(1, Math.ceil(source.replace(/^---[\s\S]*?---/, '').length / 500))
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

function Icon({ children, size = 22 }: { children: ReactNode; size?: number }) {
  return (
    <svg aria-hidden="true" className="icon" fill="none" height={size} viewBox="0 0 24 24" width={size}>
      {children}
    </svg>
  )
}

const icons = {
  home: <Icon><path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></Icon>,
  note: <Icon><path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M8 8h8M8 12h8M8 16h5" /></Icon>,
  camera: <Icon><path d="M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" /><circle cx="12" cy="13" r="4" /></Icon>,
  code: <Icon><path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 6l-4 12" /></Icon>,
  user: <Icon><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Icon>,
  search: <Icon size={28}><circle cx="10.8" cy="10.8" r="7.3" /><path d="m16.2 16.2 4.8 4.8" /></Icon>,
  menu: <Icon size={27}><path d="M4 6h16M4 12h16M4 18h16" /></Icon>,
  close: <Icon size={27}><path d="m6 6 12 12M18 6 6 18" /></Icon>,
  moon: <Icon size={24}><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" /><path d="M17 3v4M15 5h4" /></Icon>,
  github: <Icon><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7A5.5 5.5 0 0 0 19.3 3 5.2 5.2 0 0 0 19.1.5S18 0 15 2a15.4 15.4 0 0 0-8 0C4-.1 2.9.5 2.9.5A5.2 5.2 0 0 0 2.7 3a5.5 5.5 0 0 0-1.5 4.5c0 5.4 3.5 6.6 6.8 7A4.8 4.8 0 0 0 7 18v4M7 19c-3 .9-3-1.5-4-2" /></Icon>,
  mail: <Icon><rect height="15" rx="2" width="20" x="2" y="4.5" /><path d="m3 6 9 7 9-7" /></Icon>,
  wechat: <Icon><path d="M15.5 15.5c3 0 5.5-1.9 5.5-4.3S18.5 7 15.5 7 10 8.9 10 11.2c0 .8.3 1.6.9 2.2L10.3 16l2.6-1a7 7 0 0 0 2.6.5Z" /><path d="M10.5 4C6.4 4 3 6.6 3 9.8c0 1.2.5 2.3 1.3 3.2l-.8 3.3 3.5-1.4c.7.3 1.5.5 2.3.6" /><circle cx="13.7" cy="10.7" fill="currentColor" r=".6" /><circle cx="17.6" cy="10.7" fill="currentColor" r=".6" /></Icon>,
  clock: <Icon size={16}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>,
  articles: <Icon size={24}><rect height="18" rx="1.5" width="16" x="4" y="3" /><path d="M8 7h4v4H8zM15 7h1M15 10h1M8 15h8M8 18h8" /></Icon>
}

const navItems = [
  ['首页', icons.home, true], ['影集', icons.camera, false], ['三七周刊', icons.note, false],
  ['开源项目', icons.code, false], ['关于我', icons.user, false]
] as const

function formatDate(date: string) {
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date(`${date}T00:00:00`)).replaceAll('/', '.')
}

export default function Home() {
  const [latest, ...morePosts] = readPosts()

  return (
    <>
      <input aria-hidden="true" className="drawer-toggle" id="drawer-toggle" type="checkbox" />
      <header className="mobile-header">
        <label aria-label="打开导航" className="icon-button menu-button" htmlFor="drawer-toggle">{icons.menu}</label>
        <div className="mobile-avatar" aria-hidden="true">
          <img alt="" src="/icon.jpg" />
        </div>
        <span className="mobile-title">Dijkstra</span>
        <button aria-label="搜索文章" className="icon-button mobile-search" type="button">{icons.search}</button>
        <button aria-label="切换深色模式" className="icon-button mobile-theme" type="button">{icons.moon}</button>
      </header>
      <div className="mobile-drawer">
        <label aria-label="关闭导航" className="drawer-backdrop" htmlFor="drawer-toggle" />
        <aside className="drawer-panel">
          <label aria-label="关闭导航" className="icon-button drawer-close" htmlFor="drawer-toggle">{icons.close}</label>
          <nav aria-label="移动端导航">
            {navItems.map(([label, icon, active]) => (
              <a className={active ? 'active' : ''} href={active ? '/' : '#'} key={label}>{icon}<span>{label}</span></a>
            ))}
          </nav>
        </aside>
      </div>

      <main className="site-shell">
      <aside className="sidebar desktop-sidebar">
        <button aria-label="切换深色模式" className="icon-button theme-button" type="button">{icons.moon}</button>

        <div className="profile">
          <div className="avatar"><img alt="Dijkstra 的头像" src="/icon.jpg" /></div>
          <h1>Dijkstra</h1>
          <p>科技向善</p>
          <div className="social-links" aria-label="社交链接">
            <a aria-label="GitHub" href={socialProfiles.github} target="_blank" rel="noreferrer">{icons.github}</a>
            <a aria-label="邮箱" href={`mailto:${socialProfiles.email}`}>{icons.mail}</a>
            <span aria-label={`微信：${socialProfiles.wechat}`} className="social-item" title={`微信：${socialProfiles.wechat}`}>{icons.wechat}</span>
          </div>
        </div>

        <nav className="desktop-nav" aria-label="主导航">
          {navItems.map(([label, icon, active]) => (
            <a className={active ? 'active' : ''} href={active ? '/' : '#'} key={label}>{icon}<span>{label}</span></a>
          ))}
        </nav>
        <p className="sidebar-foot">© 2026 Dijkstra</p>
      </aside>

      <section className="content">
        <header className="topbar">
          <button aria-label="搜索文章" className="icon-button" type="button">{icons.search}</button>
          <div className="section-label">{icons.articles}<span>最新文章</span></div>
        </header>

        {latest && (
          <article className="featured-post">
            <h2>{latest.title}</h2>
            <p className="featured-summary">{latest.summary}</p>
            <div className="post-meta">
              <span>{latest.tags[0] ?? '随笔'}</span>
              <span>{icons.clock} 约 {latest.readingMinutes} 分钟</span>
              <time>{formatDate(latest.date)}</time>
            </div>
          </article>
        )}

        <div className="post-list">
          {morePosts.map((post, index) => (
            <article className="post-card" key={post.slug}>
              <div className="cover-wrap"><img alt="" loading={index < 2 ? 'eager' : 'lazy'} src={post.cover} /></div>
              <div className="post-copy">
                <h2>{post.title}</h2>
                <p>{post.summary}</p>
                <div className="post-footer">
                  <div className="post-meta"><span>{icons.clock} 约 {post.readingMinutes} 分钟</span><time>{formatDate(post.date)}</time></div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      </main>
    </>
  )
}
