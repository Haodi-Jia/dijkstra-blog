import { galleryContent } from '@/content/zh-CN/gallery'
import { homeContent } from '@/content/zh-CN/home'
import { postsContent } from '@/content/zh-CN/posts'
import { projectsContent } from '@/content/zh-CN/projects'
import { siteContent } from '@/content/zh-CN/site'
import { weeklyContent } from '@/content/zh-CN/weekly'

export const content = {
  gallery: galleryContent,
  home: homeContent,
  posts: postsContent,
  projects: projectsContent,
  site: siteContent,
  weekly: weeklyContent
} as const
