import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { BlogIndexItem } from './blog-index'

const BLOGS_DIR = path.join(process.cwd(), 'public', 'blogs')

const toStringOrUndefined = (value: unknown) => (typeof value === 'string' && value.trim() ? value : undefined)

const toTags = (value: unknown) => (Array.isArray(value) ? value.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0) : [])

const toTimestamp = (value: string) => {
	const timestamp = Date.parse(value)
	return Number.isNaN(timestamp) ? 0 : timestamp
}

export async function readBlogIndex(): Promise<BlogIndexItem[]> {
	const entries = await fs.readdir(BLOGS_DIR, { withFileTypes: true }).catch(() => [])

	const items = await Promise.all(
		entries
			.filter(entry => entry.isDirectory())
			.map(async (entry): Promise<BlogIndexItem | null> => {
				const slug = entry.name
				const blogDir = path.join(BLOGS_DIR, slug)
				const markdownPath = path.join(blogDir, 'index.md')
				const configPath = path.join(blogDir, 'config.json')

				try {
					await fs.access(markdownPath)
				} catch {
					return null
				}

				let rawConfig: Record<string, unknown> = {}
				try {
					const configText = await fs.readFile(configPath, 'utf8')
					rawConfig = JSON.parse(configText) as Record<string, unknown>
				} catch {
					rawConfig = {}
				}

				const item: BlogIndexItem = {
					slug,
					title: toStringOrUndefined(rawConfig.title) || slug,
					tags: toTags(rawConfig.tags),
					date: toStringOrUndefined(rawConfig.date) || ''
				}

				const summary = toStringOrUndefined(rawConfig.summary)
				const cover = toStringOrUndefined(rawConfig.cover)

				if (summary) {
					item.summary = summary
				}

				if (cover) {
					item.cover = cover
				}

				return item
			})
	)

	const validItems = items.filter((item): item is BlogIndexItem => item !== null)

	return validItems.sort((a, b) => {
		const timestampDiff = toTimestamp(b.date) - toTimestamp(a.date)
		if (timestampDiff !== 0) return timestampDiff
		return a.slug.localeCompare(b.slug)
	})
}
