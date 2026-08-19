import { notFound } from 'next/navigation'

import { readCategories } from '@/features/posts/read-posts'
import { WeeklyArchive, weeklyCategory } from '@/features/posts/components/weekly-archive'

export function generateStaticParams() {
  return readCategories().map((category) => ({ category }))
}

export default async function WeeklyCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: encodedCategory } = await params
  const category = decodeURIComponent(encodedCategory)
  const categories = [weeklyCategory, ...readCategories()]

  if (!categories.includes(category)) notFound()

  return <WeeklyArchive category={category} />
}
