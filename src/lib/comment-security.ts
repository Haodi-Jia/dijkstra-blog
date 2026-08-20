import { createHmac } from 'node:crypto'

import { getDatabase } from '@/lib/db'

type Database = ReturnType<typeof getDatabase>

type TurnstileResponse = {
  success: boolean
  hostname?: string
  action?: string
}

function getSecuritySecret() {
  const secret = process.env.COMMENT_SECURITY_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('COMMENT_SECURITY_SECRET must contain at least 32 characters')
  }
  return secret
}

export function protectedValue(value: string) {
  return createHmac('sha256', getSecuritySecret()).update(value).digest('hex')
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get('x-vercel-forwarded-for') ?? request.headers.get('x-forwarded-for')
  if (!forwarded) throw new Error('Client IP is unavailable')
  return forwarded.split(',')[0].trim()
}

export function validateWriteRequest(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin || origin !== new URL(request.url).origin) return '请求来源无效'

  const fetchSite = request.headers.get('sec-fetch-site')
  if (fetchSite && fetchSite !== 'same-origin') return '不允许跨站提交'

  if (!request.headers.get('content-type')?.startsWith('application/json')) return '请求格式无效'

  const declaredSize = Number(request.headers.get('content-length') ?? 0)
  if (declaredSize > 16_384) return '请求内容过大'

  return null
}

export async function readJsonBody(request: Request) {
  const source = await request.text()
  if (Buffer.byteLength(source, 'utf8') > 16_384) throw new Error('请求内容过大')

  const body: unknown = JSON.parse(source)
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('请求格式无效')
  return body as Record<string, unknown>
}

export async function consumeRateLimit(
  sql: Database,
  key: string,
  limit: number,
  windowSeconds: number
) {
  const result = await sql`
    INSERT INTO request_limits (key, hits, expires_at)
    VALUES (${key}, 1, NOW() + (${windowSeconds} * INTERVAL '1 second'))
    ON CONFLICT (key) DO UPDATE SET
      hits = CASE
        WHEN request_limits.expires_at <= NOW() THEN 1
        ELSE request_limits.hits + 1
      END,
      expires_at = CASE
        WHEN request_limits.expires_at <= NOW()
          THEN NOW() + (${windowSeconds} * INTERVAL '1 second')
        ELSE request_limits.expires_at
      END
    RETURNING hits
  `

  return Number(result[0].hits) <= limit
}

export async function verifyTurnstile(request: Request, token: unknown, clientIp: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) throw new Error('TURNSTILE_SECRET_KEY is not configured')
  if (typeof token !== 'string' || token.length === 0 || token.length > 2048) return false

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret, response: token, remoteip: clientIp }),
    signal: AbortSignal.timeout(5_000)
  })
  if (!response.ok) return false

  const result = await response.json() as TurnstileResponse
  if (process.env.NODE_ENV === 'development' && secret === '1x0000000000000000000000000000000AA') {
    return result.success === true
  }

  return result.success === true
    && result.action === 'comment'
    && result.hostname === new URL(request.url).hostname
}
