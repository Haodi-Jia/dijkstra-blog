import { readBlogIndex } from '@/lib/blog-index.server'

export const dynamic = 'force-static'
export const revalidate = false

export async function GET(): Promise<Response> {
	const items = await readBlogIndex()

	return new Response(JSON.stringify(items, null, 2), {
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'public, max-age=0, must-revalidate'
		}
	})
}
