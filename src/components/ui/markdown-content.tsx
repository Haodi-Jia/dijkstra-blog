import rehypeSlug from 'rehype-slug'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { LazyImage } from '@/components/ui/lazy-image'

export function MarkdownContent({ source }: { source: string }) {
  return (
    <ReactMarkdown
      components={{
        img: ({ alt, node: _node, src, ...props }) => typeof src === 'string' ? <LazyImage {...props} alt={alt ?? ''} src={src} /> : null
      }}
      rehypePlugins={[rehypeSlug]}
      remarkPlugins={[remarkGfm]}
    >
      {source}
    </ReactMarkdown>
  )
}
