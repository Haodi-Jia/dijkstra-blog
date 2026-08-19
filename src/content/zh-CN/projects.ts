import type { Project } from '@/features/projects/types'

export const projectsContent = {
  title: '开源项目',
  metadata: {
    title: '开源项目',
    description: '我参与和维护的开源项目'
  },
  intro: '一些正在维护的工具与实验项目，围绕 AI Agent、研究工作流和软件工程展开。',
  labels: {
    count: '个项目',
    githubLink: '在 GitHub 查看',
    stars: '个 Star'
  },
  projects: [
    {
      name: 'Agent Canvas',
      description: '一个面向 AI Agent 的可视化工作流编辑器，用节点连接工具、模型与业务逻辑。',
      language: 'TypeScript',
      languageColor: '#3178c6',
      stars: 286,
      tags: ['Agent', 'Workflow', 'Next.js'],
      href: 'https://github.com/Haodi-Jia'
    },
    {
      name: 'Paper Lens',
      description: '将论文阅读、重点标注和知识整理串联起来的轻量研究助手。',
      language: 'Python',
      languageColor: '#3572a5',
      stars: 174,
      tags: ['LLM', 'Research', 'RAG'],
      href: 'https://github.com/Haodi-Jia'
    },
    {
      name: 'Tiny Eval',
      description: '简洁、可组合的大模型评测工具，适合快速验证提示词和 Agent 的输出质量。',
      language: 'Python',
      languageColor: '#3572a5',
      stars: 93,
      tags: ['Evaluation', 'CLI', 'Dataset'],
      href: 'https://github.com/Haodi-Jia'
    },
    {
      name: 'Dijkstra Blog',
      description: '这个博客的源代码，专注于舒适的阅读体验与易维护的 Markdown 内容工作流。',
      language: 'TypeScript',
      languageColor: '#3178c6',
      stars: 48,
      tags: ['Blog', 'Markdown', 'shadcn/ui'],
      href: 'https://github.com/Haodi-Jia'
    }
  ] satisfies Project[]
} as const
