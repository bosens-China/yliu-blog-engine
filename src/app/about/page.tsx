import { getBlogData } from "@/lib/data";
import MarkdownContent from "@/components/MarkdownContent";

export default function AboutPage() {
  const { about } = getBlogData();

  return (
    <div className="container mx-auto pt-6">
      <div className="max-w-5xl mx-auto bg-white dark:bg-card rounded-lg shadow-sm p-6 md:p-8 border border-border/20">
        <article className="prose dark:prose-invert max-w-none">
          {about ? (
            <MarkdownContent content={about} />
          ) : (
            <p>
              暂无关于我的信息。请在 GitHub 仓库中创建一个 `about.md`
              文件并写入你的介绍。
            </p>
          )}
        </article>
      </div>
    </div>
  );
}
