import type { GalleryPhoto } from '@/features/gallery/types'

export const galleryContent = {
  title: '图库',
  metadata: {
    title: '影集',
    description: '记录时光与生活的照片集'
  },
  labels: {
    all: '全部',
    categories: '照片分类',
    search: '搜索照片'
  },
  photos: [
    {
      alt: '武汉大学2026年学位授予仪式留影',
      category: '纪念',
      height: 3872,
      src: '/yingji/ARMM4533_11zon.webp',
      width: 4494
    },
    {
      alt: '夕阳下靠在墙边的女生',
      category: '人像',
      height: 2160,
      src: '/yingji/lyf.webp',
      width: 3840
    }
  ] satisfies GalleryPhoto[]
} as const
