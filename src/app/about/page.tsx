import { PageHeader } from '@/components/layout/page-header'
import { PageShell } from '@/components/layout/page-shell'

export default function AboutPage() {
  return (
    <PageShell activeHref="/about">
      <PageHeader articleIcon={false} large title="关于" />

      <article className="ml-[58px] max-w-[920px] pt-[112px] text-[17px] leading-[2] max-[1100px]:ml-[38px] max-[760px]:ml-0 max-[760px]:pt-14 max-[760px]:text-base max-[760px]:leading-[1.9]">
        <section>
          <h2 className="mb-7 text-[30px] leading-tight font-[720] tracking-[-0.035em] max-[760px]:mb-5 max-[760px]:text-2xl">关于我</h2>
          <ul className="ml-6 list-disc space-y-2 text-foreground/90 marker:text-muted-foreground">
            <li>关注人工智能、Agent 与软件工程</li>
            <li>主要使用 TypeScript 和 Python</li>
            <li>喜欢研究工具、模型与真实产品之间如何协作</li>
            <li>持续学习，也持续记录</li>
          </ul>
        </section>

        <section className="mt-16 max-[760px]:mt-12">
          <h2 className="mb-7 text-[30px] leading-tight font-[720] tracking-[-0.035em] max-[760px]:mb-5 max-[760px]:text-2xl">关于本博客</h2>
          <div className="space-y-6 text-foreground/90">
            <p>这里用于记录我在人工智能、Agent、持续学习与软件工程方向上的实践和思考。文章既包含具体工具的使用，也包含论文阅读、模型研究与项目复盘。</p>
            <p>博客使用 Next.js、TypeScript、Tailwind CSS 和 shadcn/ui 构建。内容以 Markdown 文件保存，希望在保持阅读体验简洁的同时，让内容和代码都容易维护。</p>
            <p>写作是整理知识的一种方式。这里的文章会随着理解不断更新，也希望这些记录能为遇到相同问题的人提供一点帮助。</p>
          </div>
        </section>
      </article>
    </PageShell>
  )
}
