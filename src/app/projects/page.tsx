import type { Metadata } from 'next'

import { PageContent } from '@/components/layout/page-content'
import { PageHeader } from '@/components/layout/page-header'
import { PageShell } from '@/components/layout/page-shell'
import { icons } from '@/components/ui/icons'
import { content } from '@/content'
import { ProjectCard } from '@/features/projects/components/project-card'

export const metadata: Metadata = {
  title: content.projects.metadata.title,
  description: content.projects.metadata.description
}

export default function ProjectsPage() {
  const { intro, labels, projects, title } = content.projects

  return (
    <PageShell activeHref="/projects">
      <PageHeader icon={icons.code} title={title} />

      <PageContent className="mt-[58px] max-w-[1000px] max-[760px]:mt-8">
        <div className="mb-9 flex items-end justify-between gap-8 border-b pb-8 max-[760px]:mb-6 max-[760px]:items-start max-[760px]:pb-6">
          <p className="max-w-[620px] text-[17px] leading-[1.85] text-muted-foreground max-[760px]:text-base max-[760px]:leading-[1.75]">
            {intro}
          </p>
          <span className="shrink-0 text-sm text-muted-foreground/70">{projects.length} {labels.count}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 max-[960px]:grid-cols-1">
          {projects.map((project) => (
            <ProjectCard
              githubLinkLabel={labels.githubLink}
              key={project.name}
              project={project}
              starLabel={labels.stars}
            />
          ))}
        </div>
      </PageContent>
    </PageShell>
  )
}
