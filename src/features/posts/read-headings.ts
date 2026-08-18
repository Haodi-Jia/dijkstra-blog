import GithubSlugger from 'github-slugger'

export type PostHeading = {
  id: string
  level: number
  text: string
}

export function readHeadings(content: string) {
  const slugger = new GithubSlugger()

  return content
    .split('\n')
    .flatMap<PostHeading>((line) => {
      const match = /^(#{2,4})\s+(.+)$/.exec(line)
      if (!match) return []

      const text = match[2]
        .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
        .replace(/[*_`~]/g, '')
        .trim()

      return [{ id: slugger.slug(text), level: match[1].length, text }]
    })
}
