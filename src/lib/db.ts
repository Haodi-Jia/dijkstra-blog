import { neon } from '@neondatabase/serverless'

let schemaPromise: Promise<void> | null = null

export function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured')
  }

  return neon(databaseUrl)
}

export function ensureDatabaseSchema() {
  if (schemaPromise) return schemaPromise

  schemaPromise = (async () => {
    const sql = getDatabase()

    await sql`
      CREATE TABLE IF NOT EXISTS post_likes (
        post_slug TEXT NOT NULL,
        visitor_id UUID NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (post_slug, visitor_id)
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_slug TEXT NOT NULL,
        parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
        visitor_id UUID NOT NULL,
        nickname VARCHAR(30) NOT NULL,
        email VARCHAR(254) NOT NULL,
        website TEXT,
        content TEXT NOT NULL,
        ip_hash CHAR(64),
        content_hash CHAR(64),
        status VARCHAR(16) NOT NULL DEFAULT 'approved'
          CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `

    await sql`ALTER TABLE comments ADD COLUMN IF NOT EXISTS ip_hash CHAR(64)`
    await sql`ALTER TABLE comments ADD COLUMN IF NOT EXISTS content_hash CHAR(64)`

    await sql`
      CREATE INDEX IF NOT EXISTS comments_post_created_idx
      ON comments (post_slug, created_at)
    `

    await sql`
      CREATE TABLE IF NOT EXISTS comment_likes (
        comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
        visitor_id UUID NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (comment_id, visitor_id)
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS request_limits (
        key TEXT PRIMARY KEY,
        hits INTEGER NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL
      )
    `
  })()

  return schemaPromise
}
