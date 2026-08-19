# Dijkstra Blog

一个重新开始的个人博客项目。

## 开发

```bash
npm install
npm run dev
```

博客内容使用带 YAML frontmatter 的 Markdown，保存在 `public/blogs/*.md`，文章图片保存在 `public/images/`。

## 项目结构

```text
public/blogs/        Markdown 文章
public/images/       文章图片等静态资源
src/app/             路由、页面组合与 Metadata
src/components/ui/   shadcn/ui 基础组件
src/components/layout/ 全站共享布局
src/config/          与语言无关的站点配置
src/content/         按语言组织的界面文案与静态内容
src/features/        按领域组织的组件、类型与业务逻辑
```

页面不直接维护业务数据或界面文案。界面内容统一维护在 `src/content/zh-CN/`。
