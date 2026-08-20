'use client'

import {
  CircleDollarSign,
  Heart,
  LoaderCircle,
  MessageSquare,
  Reply,
  Send,
  Share2
} from 'lucide-react'
import Script from 'next/script'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { siteConfig } from '@/config/site'
import { CommentEditor, type CommentEditorHandle } from '@/features/posts/components/comment-editor'
import { cn } from '@/lib/utils'

type Comment = {
  id: string
  parentId: string | null
  nickname: string
  website: string | null
  content: string
  createdAt: string
  likeCount: number
}

type Engagement = {
  likeCount: number
  liked: boolean
  likedCommentIds: string[]
  comments: Comment[]
}

const EMPTY_ENGAGEMENT: Engagement = {
  likeCount: 0,
  liked: false,
  likedCommentIds: [],
  comments: []
}

const commentSanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'u']
}

function CommentMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        a: ({ children, ...props }) => <a {...props} rel="noreferrer nofollow ugc" target="_blank">{children}</a>
      }}
      rehypePlugins={[rehypeRaw, [rehypeSanitize, commentSanitizeSchema]]}
      remarkPlugins={[remarkGfm]}
    >{content}</ReactMarkdown>
  )
}

declare global {
  interface Window {
    turnstile?: { reset: () => void }
  }
}

function getVisitorId() {
  const storageKey = 'dijkstra-blog-visitor-id'
  const stored = localStorage.getItem(storageKey)
  if (stored) return stored

  const visitorId = crypto.randomUUID()
  localStorage.setItem(storageKey, visitorId)
  return visitorId
}

function relativeTime(value: string) {
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000)
  const formatter = new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' })
  const units = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60]
  ] as const

  for (const [unit, duration] of units) {
    if (Math.abs(seconds) >= duration) return formatter.format(Math.round(seconds / duration), unit)
  }

  return formatter.format(seconds, 'second')
}

function EngagementBar({
  className,
  engagement,
  onComment,
  onLike,
  onReward,
  onShare
}: {
  className?: string
  engagement: Engagement
  onComment: () => void
  onLike: () => void
  onReward: () => void
  onShare: () => void
}) {
  return (
    <div className={cn('flex h-[62px] items-center gap-1 rounded-full border border-border/80 bg-background/95 px-4 text-muted-foreground shadow-[0_14px_34px_rgba(35,40,52,0.16)] backdrop-blur-md dark:shadow-[0_16px_38px_rgba(0,0,0,0.45)]', className)}>
      <Button aria-label="点赞" className={cn('h-10 gap-2 rounded-full px-3 text-base font-normal', engagement.liked && 'text-rose-500')} onClick={onLike} variant="ghost">
        <Heart className={cn('size-[22px]', engagement.liked && 'fill-current')} />
        <span>{engagement.likeCount}</span>
      </Button>
      <Button aria-label="查看评论" className="h-10 gap-2 rounded-full px-3 text-base font-normal" onClick={onComment} variant="ghost">
        <MessageSquare className="size-[22px]" />
        <span>{engagement.comments.length}</span>
      </Button>
      <Button aria-label="赞赏作者" className="size-10 rounded-full" onClick={onReward} size="icon" title="复制作者微信号" variant="ghost">
        <CircleDollarSign className="size-[22px]" />
      </Button>
      <Button aria-label="分享文章" className="size-10 rounded-full" onClick={onShare} size="icon" title="复制文章链接" variant="ghost">
        <Share2 className="size-[22px]" />
      </Button>
    </div>
  )
}

function CommentForm({
  onCancelReply,
  onCreated,
  postSlug,
  replyingTo,
  turnstileSiteKey,
  visitorId
}: {
  onCancelReply: () => void
  onCreated: (comment: Comment) => void
  postSlug: string
  replyingTo: Comment | null
  turnstileSiteKey: string
  visitorId: string
}) {
  const editorRef = useRef<CommentEditorHandle>(null)
  const [content, setContent] = useState('')
  const [characterCount, setCharacterCount] = useState(0)
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (replyingTo) editorRef.current?.focus()
  }, [replyingTo])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (characterCount < 2) {
      setMessage('评论需要填写至少 2 个字符')
      editorRef.current?.focus()
      return
    }

    const turnstileToken = new FormData(event.currentTarget).get('cf-turnstile-response')
    setSubmitting(true)
    setMessage('')

    const response = await fetch(`/api/posts/${encodeURIComponent(postSlug)}/engagement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create-comment',
        visitorId,
        parentId: replyingTo?.id ?? null,
        nickname,
        email,
        website,
        content,
        company,
        turnstileToken
      })
    })
    const result = await response.json()
    window.turnstile?.reset()

    if (!response.ok) {
      setMessage(result.message)
      setSubmitting(false)
      return
    }

    localStorage.setItem('dijkstra-blog-commenter', JSON.stringify({ nickname, email, website }))
    setContent('')
    setCharacterCount(0)
    editorRef.current?.clear()
    setMessage('评论已发布')
    setSubmitting(false)
    onCreated(result.comment)
    onCancelReply()
  }

  useEffect(() => {
    const commenter = localStorage.getItem('dijkstra-blog-commenter')
    if (!commenter) return

    const saved = JSON.parse(commenter)
    setNickname(saved.nickname ?? '')
    setEmail(saved.email ?? '')
    setWebsite(saved.website ?? '')
  }, [])

  return (
    <form className="mt-8" onSubmit={submit}>
      {replyingTo && (
        <div className="mb-3 flex items-center justify-between rounded-xl bg-muted px-4 py-2 text-sm text-muted-foreground">
          <span>回复 @{replyingTo.nickname}</span>
          <button className="hover:text-foreground" onClick={onCancelReply} type="button">取消回复</button>
        </div>
      )}
      <CommentEditor
        onChange={(html, count) => {
          setContent(html)
          setCharacterCount(count)
          setMessage('')
        }}
        placeholder={replyingTo ? `回复 ${replyingTo.nickname}` : '编写评论'}
        ref={editorRef}
      />

      <div className="mt-4 grid grid-cols-3 gap-3 max-[760px]:grid-cols-1">
        <Input autoComplete="name" className="h-14 px-5 text-base shadow-sm" maxLength={30} onChange={(event) => setNickname(event.target.value)} placeholder="昵称" required value={nickname} />
        <Input autoComplete="email" className="h-14 px-5 text-base shadow-sm" maxLength={254} onChange={(event) => setEmail(event.target.value)} placeholder="电子邮箱（不会公开）" required type="email" value={email} />
        <Input autoComplete="url" className="h-14 px-5 text-base shadow-sm" onChange={(event) => setWebsite(event.target.value)} placeholder="网站（选填）" value={website} />
      </div>
      <input aria-hidden="true" autoComplete="off" className="hidden" onChange={(event) => setCompany(event.target.value)} tabIndex={-1} value={company} />

      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      <div className="mt-5 flex min-h-[65px] items-start justify-between gap-5 max-[760px]:flex-col">
        <div>
          <div className="cf-turnstile" data-action="comment" data-sitekey={turnstileSiteKey} data-theme="auto" />
          <p aria-live="polite" className={cn('mt-2 text-sm text-muted-foreground', message === '评论已发布' && 'text-emerald-600 dark:text-emerald-400')}>{message}</p>
        </div>
        <Button className="h-13 gap-2 rounded-xl bg-[#4ccdac] px-6 text-base text-white shadow-sm hover:bg-[#3fbea0] max-[760px]:self-end" disabled={submitting} type="submit">
          {submitting ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
          提交评论
        </Button>
      </div>
    </form>
  )
}

function CommentItem({
  comment,
  likedCommentIds,
  onLike,
  onReply,
  replies
}: {
  comment: Comment
  likedCommentIds: string[]
  onLike: (comment: Comment) => void
  onReply: (comment: Comment) => void
  replies: Comment[]
}) {
  const name = comment.nickname.slice(0, 1).toUpperCase()
  const liked = likedCommentIds.includes(comment.id)
  const author = comment.website ? (
    <a className="font-semibold text-foreground hover:underline" href={comment.website} rel="noreferrer nofollow ugc" target="_blank">{comment.nickname}</a>
  ) : <span className="font-semibold text-foreground">{comment.nickname}</span>

  return (
    <div className="flex gap-4 py-6">
      <Avatar className="size-11 border-0 bg-muted" size="lg">
        <AvatarFallback className="text-base font-semibold text-foreground">{name}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {author}
          <time className="text-sm text-muted-foreground" dateTime={comment.createdAt}>{relativeTime(comment.createdAt)}</time>
        </div>
        <div className="comment-content mt-2 text-[15px] leading-7 text-foreground/90">
          <CommentMarkdown content={comment.content} />
        </div>
        <div className="mt-3 flex items-center gap-1">
          <Button className={cn('h-8 gap-1.5 rounded-lg px-2 text-muted-foreground', liked && 'text-rose-500')} onClick={() => onLike(comment)} variant="ghost">
            <Heart className={cn('size-4', liked && 'fill-current')} />
            {comment.likeCount}
          </Button>
          <Button className="h-8 gap-1.5 rounded-lg px-2 text-muted-foreground" onClick={() => onReply(comment)} variant="ghost">
            <Reply className="size-4" />
            回复
          </Button>
        </div>

        {replies.length > 0 && (
          <div className="mt-3 border-l border-border pl-5 max-[760px]:-ml-10 max-[760px]:pl-4">
            {replies.map((reply) => (
              <CommentItem comment={reply} key={reply.id} likedCommentIds={likedCommentIds} onLike={onLike} onReply={onReply} replies={[]} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function ArticleEngagement({ postSlug, turnstileSiteKey }: { postSlug: string; turnstileSiteKey: string }) {
  const anchorRef = useRef<HTMLDivElement>(null)
  const commentsRef = useRef<HTMLElement>(null)
  const [visitorId, setVisitorId] = useState('')
  const [engagement, setEngagement] = useState(EMPTY_ENGAGEMENT)
  const [fixed, setFixed] = useState(true)
  const [notice, setNotice] = useState('')
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null)

  const loadEngagement = useCallback(async (id: string) => {
    const response = await fetch(`/api/posts/${encodeURIComponent(postSlug)}/engagement?visitorId=${encodeURIComponent(id)}`, { cache: 'no-store' })
    if (!response.ok) return
    setEngagement(await response.json())
  }, [postSlug])

  useEffect(() => {
    const id = getVisitorId()
    setVisitorId(id)
    void loadEngagement(id)
  }, [loadEngagement])

  useEffect(() => {
    const anchor = anchorRef.current
    if (!anchor) return

    const observer = new IntersectionObserver(([entry]) => setFixed(!entry.isIntersecting), { threshold: 0.85 })
    observer.observe(anchor)
    return () => observer.disconnect()
  }, [])

  const rootComments = useMemo(() => engagement.comments.filter((comment) => !comment.parentId), [engagement.comments])
  const repliesByParent = useMemo(() => {
    return engagement.comments.reduce<Record<string, Comment[]>>((groups, comment) => {
      if (comment.parentId) (groups[comment.parentId] ??= []).push(comment)
      return groups
    }, {})
  }, [engagement.comments])

  async function toggleLike() {
    if (!visitorId) return
    const response = await fetch(`/api/posts/${encodeURIComponent(postSlug)}/engagement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle-like', visitorId })
    })
    if (!response.ok) return
    const result = await response.json()
    setEngagement((current) => ({ ...current, liked: result.liked, likeCount: result.likeCount }))
  }

  async function toggleCommentLike(comment: Comment) {
    if (!visitorId) return
    const response = await fetch(`/api/posts/${encodeURIComponent(postSlug)}/engagement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle-comment-like', visitorId, commentId: comment.id })
    })
    if (!response.ok) return
    const result = await response.json()
    setEngagement((current) => ({
      ...current,
      likedCommentIds: result.liked
        ? [...current.likedCommentIds, comment.id]
        : current.likedCommentIds.filter((id) => id !== comment.id),
      comments: current.comments.map((item) => item.id === comment.id ? { ...item, likeCount: result.likeCount } : item)
    }))
  }

  function scrollToComments() {
    commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function reward() {
    await navigator.clipboard.writeText(siteConfig.social.wechat)
    setNotice('微信号已复制')
    window.setTimeout(() => setNotice(''), 1800)
  }

  async function share() {
    await navigator.clipboard.writeText(window.location.href)
    setNotice('文章链接已复制')
    window.setTimeout(() => setNotice(''), 1800)
  }

  const barProps = {
    engagement,
    onComment: scrollToComments,
    onLike: toggleLike,
    onReward: reward,
    onShare: share
  }

  return (
    <>
      <div className="mt-14 flex min-h-[62px] justify-center" ref={anchorRef}>
        <EngagementBar className={cn(fixed && 'invisible')} {...barProps} />
      </div>
      {fixed && (
        <EngagementBar className="fixed bottom-7 left-[calc(50%+197px)] z-30 -translate-x-1/2 max-[1200px]:left-[calc(50%+162px)] max-[760px]:bottom-4 max-[760px]:left-1/2" {...barProps} />
      )}
      <p aria-live="polite" className={cn('pointer-events-none fixed bottom-[102px] left-[calc(50%+197px)] z-40 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-sm text-background shadow-lg transition-opacity max-[1200px]:left-[calc(50%+162px)] max-[760px]:left-1/2', notice ? 'opacity-100' : 'opacity-0')}>{notice}</p>

      <section className="mt-16 scroll-mt-8" id="comments" ref={commentsRef}>
        <div className="border-b border-border pb-4">
          <h2 className="text-[22px] font-bold tracking-[-0.025em]">{engagement.comments.length} 条评论</h2>
        </div>

        {visitorId && (
          <CommentForm
            onCancelReply={() => setReplyingTo(null)}
            onCreated={(comment) => setEngagement((current) => ({ ...current, comments: [...current.comments, comment] }))}
            postSlug={postSlug}
            replyingTo={replyingTo}
            turnstileSiteKey={turnstileSiteKey}
            visitorId={visitorId}
          />
        )}

        <div className="mt-8 divide-y divide-border">
          {rootComments.map((comment) => (
            <CommentItem
              comment={comment}
              key={comment.id}
              likedCommentIds={engagement.likedCommentIds}
              onLike={toggleCommentLike}
              onReply={(target) => {
                setReplyingTo(target)
                commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              replies={repliesByParent[comment.id] ?? []}
            />
          ))}
          {engagement.comments.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">还没有评论，来留下第一条吧。</p>
          )}
        </div>
      </section>
    </>
  )
}
