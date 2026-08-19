import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { Post } from './types'

const postsDirectory = join(process.cwd(), 'public', 'blogs')

function readField(frontmatter: string, name: string) {
  return frontmatter.match(new RegExp(`^${name}:\\s*["']?(.*?)["']?$`, 'm'))?.[1] ?? ''
}

function parsePost(fileName: string): Post {
  const source = readFileSync(join(postsDirectory, fileName), 'utf8')
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
  const tagValue = readField(frontmatter, 'tags')
  const content = source.replace(/^---[\s\S]*?---/, '').trim()

  return {
    slug: fileName.replace(/\.md$/, ''),
    title: readField(frontmatter, 'title'),
    date: readField(frontmatter, 'date'),
    summary: readField(frontmatter, 'summary'),
    cover: readField(frontmatter, 'cover'),
    tags: [...tagValue.matchAll(/["']([^"']+)["']/g)].map((match) => match[1]),
    readingMinutes: Math.max(1, Math.ceil(content.length / 500)),
    content
  }
}

export function readPost(slug: string) {
  return readPosts().find((post) => post.slug === slug)
}

export function readPosts() {
  return readdirSync(postsDirectory)
    .filter((fileName) => fileName.endsWith('.md'))
    .map(parsePost)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function readCategories() {
  return Array.from(new Set(readPosts().flatMap((post) => post.tags)))
}
