import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { icons } from '@/components/ui/icons'
import type { Project } from '@/features/projects/types'

type ProjectCardProps = {
  githubLinkLabel: string
  project: Project
  starLabel: string
}

export function ProjectCard({ githubLinkLabel, project, starLabel }: ProjectCardProps) {
  return (
    <Card className="group gap-0 rounded-2xl bg-transparent py-0 ring-border transition-[transform,box-shadow,background-color] duration-300 hover:-translate-y-1 hover:bg-card hover:shadow-[0_18px_45px_rgba(35,40,52,0.08)] dark:hover:shadow-[0_18px_45px_rgba(0,0,0,0.22)] motion-reduce:transition-none">
      <CardHeader className="gap-3 px-6 pt-6 max-[760px]:px-5 max-[760px]:pt-5">
        <div className="flex items-start justify-between gap-5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:text-foreground">
            {icons.code}
          </div>
          <a
            aria-label={`${githubLinkLabel} ${project.name}`}
            className="rounded-lg p-2 text-muted-foreground/65 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={project.href}
            rel="noreferrer"
            target="_blank"
          >
            {icons.github}
          </a>
        </div>
        <CardTitle className="text-xl font-[680] tracking-[-0.02em]">
          <a className="article-title-link" href={project.href} rel="noreferrer" target="_blank">
            {project.name}
          </a>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col px-6 pt-3 max-[760px]:px-5">
        <CardDescription className="min-h-[58px] text-[15px] leading-[1.75] max-[960px]:min-h-0">
          {project.description}
        </CardDescription>
        <div className="mt-5 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground" key={tag}>{tag}</span>
          ))}
        </div>
      </CardContent>

      <CardFooter className="mt-6 gap-5 border-t bg-transparent px-6 py-4 text-xs text-muted-foreground/80 max-[760px]:px-5">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="size-2.5 rounded-full" style={{ backgroundColor: project.languageColor }} />
          {project.language}
        </span>
        <span aria-label={`${project.stars} ${starLabel}`} className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="text-base leading-none">☆</span>
          {project.stars}
        </span>
      </CardFooter>
    </Card>
  )
}
