import { NextResponse } from 'next/server'

import {
  consumeRateLimit,
  getClientIp,
  protectedValue,
  readJsonBody,
  validateWriteRequest,
  verifyTurnstile
} from '@/lib/comment-security'
import { ensureDatabaseSchema, getDatabase } from '@/lib/db'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const POST_SLUG_PATTERN = /^[a-z0-9_-]{1,80}$/i
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/
const URL_PATTERN = /https?:\/\/|www\./gi

export const runtime = 'nodejs'

type RouteContext = { params: Promise<{ slug: string }> }

type CommentRow = {
  id: string
  parent_id: string | null
  nickname: string
  website: string | null
  content: string
  created_at: string
  like_count: number | string
}

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store' }
  })
}

function isVisitorId(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value)
}

function normalizeWebsite(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return null

  const source = value.trim()
  const url = new URL(source.includes('://') ? source : `https://${source}`)

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('网站地址仅支持 HTTP 或 HTTPS')
  }

  return url.toString()
}

export async function GET(request: Request, { params }: RouteContext) {
  const { slug } = await params
  if (!POST_SLUG_PATTERN.test(slug)) return json({ message: '文章不存在' }, 404)
  const visitorId = new URL(request.url).searchParams.get('visitorId')

  await ensureDatabaseSchema()
  const sql = getDatabase()
  const [likes, comments, visitorLike, visitorCommentLikes] = await Promise.all([
    sql`SELECT COUNT(*)::int AS count FROM post_likes WHERE post_slug = ${slug}`,
    sql`
      SELECT
        c.id,
        c.parent_id,
        c.nickname,
        c.website,
        c.content,
        c.created_at,
        COUNT(cl.comment_id)::int AS like_count
      FROM comments c
      LEFT JOIN comment_likes cl ON cl.comment_id = c.id
      WHERE c.post_slug = ${slug} AND c.status = 'approved'
      GROUP BY c.id
      ORDER BY c.created_at ASC
    `,
    isVisitorId(visitorId)
      ? sql`SELECT EXISTS(SELECT 1 FROM post_likes WHERE post_slug = ${slug} AND visitor_id = ${visitorId}) AS liked`
      : Promise.resolve([{ liked: false }]),
    isVisitorId(visitorId)
      ? sql`
          SELECT cl.comment_id
          FROM comment_likes cl
          JOIN comments c ON c.id = cl.comment_id
          WHERE c.post_slug = ${slug} AND cl.visitor_id = ${visitorId}
        `
      : Promise.resolve([])
  ])

  return json({
    likeCount: Number(likes[0].count),
    liked: Boolean(visitorLike[0].liked),
    likedCommentIds: visitorCommentLikes.map((row) => String(row.comment_id)),
    comments: (comments as CommentRow[]).map((comment) => ({
      id: comment.id,
      parentId: comment.parent_id,
      nickname: comment.nickname,
      website: comment.website,
      content: comment.content,
      createdAt: comment.created_at,
      likeCount: Number(comment.like_count)
    }))
  })
}

export async function POST(request: Request, { params }: RouteContext) {
  const { slug } = await params
  if (!POST_SLUG_PATTERN.test(slug)) return json({ message: '文章不存在' }, 404)

  const requestError = validateWriteRequest(request)
  if (requestError) return json({ message: requestError }, 403)

  let body: Record<string, unknown>
  try {
    body = await readJsonBody(request)
  } catch (error) {
    return json({ message: error instanceof Error ? error.message : '请求格式无效' }, 400)
  }

  if (!isVisitorId(body.visitorId)) {
    return json({ message: '无效的访客标识' }, 400)
  }

  await ensureDatabaseSchema()
  const sql = getDatabase()
  const clientIp = getClientIp(request)
  const ipHash = protectedValue(clientIp)

  if (!await consumeRateLimit(sql, `write:${ipHash}`, 60, 600)) {
    return json({ message: '操作过于频繁，请稍后再试' }, 429)
  }

  if (body.action === 'toggle-like') {
    if (!await consumeRateLimit(sql, `reaction:${ipHash}`, 40, 600)) {
      return json({ message: '操作过于频繁，请稍后再试' }, 429)
    }
    const removed = await sql`
      DELETE FROM post_likes
      WHERE post_slug = ${slug} AND visitor_id = ${body.visitorId}
      RETURNING visitor_id
    `

    if (removed.length === 0) {
      await sql`
        INSERT INTO post_likes (post_slug, visitor_id)
        VALUES (${slug}, ${body.visitorId})
      `
    }

    const result = await sql`SELECT COUNT(*)::int AS count FROM post_likes WHERE post_slug = ${slug}`
    return json({ liked: removed.length === 0, likeCount: Number(result[0].count) })
  }

  if (body.action === 'toggle-comment-like') {
    if (!isVisitorId(body.commentId)) return json({ message: '评论不存在' }, 400)

    const comment = await sql`
      SELECT id FROM comments
      WHERE id = ${body.commentId} AND post_slug = ${slug} AND status = 'approved'
    `
    if (comment.length === 0) return json({ message: '评论不存在' }, 404)

    const removed = await sql`
      DELETE FROM comment_likes
      WHERE comment_id = ${body.commentId} AND visitor_id = ${body.visitorId}
      RETURNING visitor_id
    `
    if (removed.length === 0) {
      await sql`
        INSERT INTO comment_likes (comment_id, visitor_id)
        VALUES (${body.commentId}, ${body.visitorId})
      `
    }

    const result = await sql`
      SELECT COUNT(*)::int AS count FROM comment_likes WHERE comment_id = ${body.commentId}
    `
    return json({ liked: removed.length === 0, likeCount: Number(result[0].count) })
  }

  if (body.action !== 'create-comment') {
    return json({ message: '不支持的操作' }, 400)
  }

  if (body.company) return json({ message: '评论提交失败' }, 400)

  const nickname = typeof body.nickname === 'string' ? body.nickname.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const content = typeof body.content === 'string' ? body.content.trim() : ''
  const visibleContent = content.replace(/<[^>]*>/g, '').replace(/&(?:#\d+|#x[\da-f]+|\w+);/gi, 'x').trim()
  const parentId = body.parentId === null || body.parentId === undefined ? null : body.parentId

  if (nickname.length < 2 || nickname.length > 30) {
    return json({ message: '昵称需要填写 2–30 个字符' }, 400)
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return json({ message: '请填写有效的电子邮箱' }, 400)
  }
  if (visibleContent.length < 2 || visibleContent.length > 2000 || content.length > 8_000) {
    return json({ message: '评论需要填写 2–2000 个字符' }, 400)
  }
  if (CONTROL_CHARACTER_PATTERN.test(nickname) || CONTROL_CHARACTER_PATTERN.test(content)) {
    return json({ message: '评论包含无效字符' }, 400)
  }
  if ((content.match(URL_PATTERN) ?? []).length > 3) {
    return json({ message: '评论中的链接数量不能超过 3 个' }, 400)
  }
  if (/(.)\1{15}/u.test(content)) {
    return json({ message: '评论包含过多重复字符' }, 400)
  }
  if (parentId !== null && !isVisitorId(parentId)) {
    return json({ message: '回复的评论不存在' }, 400)
  }

  let website: string | null
  try {
    website = normalizeWebsite(body.website)
  } catch (error) {
    return json({ message: error instanceof Error ? error.message : '网站地址无效' }, 400)
  }

  const [ipAllowed, visitorAllowed] = await Promise.all([
    consumeRateLimit(sql, `comment-ip:${ipHash}`, 5, 3600),
    consumeRateLimit(sql, `comment-visitor:${body.visitorId}`, 3, 3600)
  ])
  if (!ipAllowed || !visitorAllowed) {
    return json({ message: '评论提交次数过多，请一小时后再试' }, 429)
  }

  if (!await verifyTurnstile(request, body.turnstileToken, clientIp)) {
    return json({ message: '人机验证失败，请刷新后重试' }, 403)
  }

  let rootParentId = parentId
  if (parentId) {
    const parent = await sql`
      SELECT COALESCE(parent_id, id) AS root_id FROM comments
      WHERE id = ${parentId} AND post_slug = ${slug} AND status = 'approved'
    `
    if (parent.length === 0) return json({ message: '回复的评论不存在' }, 400)
    rootParentId = String(parent[0].root_id)
  }

  const contentHash = protectedValue(`${slug}\n${content.toLocaleLowerCase()}`)
  const recentComment = await sql`
    SELECT id FROM comments
    WHERE
      (visitor_id = ${body.visitorId} AND created_at > NOW() - INTERVAL '20 seconds')
      OR (
        ip_hash = ${ipHash}
        AND content_hash = ${contentHash}
        AND created_at > NOW() - INTERVAL '24 hours'
      )
    LIMIT 1
  `
  if (recentComment.length > 0) {
    return json({ message: '请勿重复提交相同评论' }, 409)
  }

  const emailHash = protectedValue(email)
  const inserted = await sql`
    INSERT INTO comments (
      post_slug, parent_id, visitor_id, nickname, email, website, content, ip_hash, content_hash
    ) VALUES (
      ${slug}, ${rootParentId}, ${body.visitorId}, ${nickname}, ${emailHash}, ${website}, ${content}, ${ipHash}, ${contentHash}
    )
    RETURNING id, parent_id, nickname, website, content, created_at
  `

  return json({
    comment: {
      id: inserted[0].id,
      parentId: inserted[0].parent_id,
      nickname: inserted[0].nickname,
      website: inserted[0].website,
      content: inserted[0].content,
      createdAt: inserted[0].created_at,
      likeCount: 0
    }
  }, 201)
}
