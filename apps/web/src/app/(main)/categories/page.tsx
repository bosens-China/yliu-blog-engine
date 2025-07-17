import { getLabels, getBlogData } from "@/lib/data";
import Link from "next/link";

export default function CategoriesPage() {
  const labels = getLabels();
  const { posts } = getBlogData();
  const totalPosts = posts.length;

  return (
    <div className="max-w-5xl mx-auto page-content-bg rounded-lg p-6 border border-border/20 dark:border-transparent">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">所有分类</h1>
        <p className="text-muted-foreground">
          共 {labels.length} 个分类标签，{totalPosts} 篇文章
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/page/1"
          className="flex items-center gap-2 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-full px-4 py-2 hover:border-primary hover:bg-primary/10 transition-all group"
        >
          <span className="font-medium text-primary transition-colors">
            📖 全部文章
          </span>
          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {totalPosts}
          </span>
        </Link>

        {labels.map((label) => (
          <Link
            key={label.name}
            href={`/category/${label.name}`}
            className="flex items-center gap-2 page-content-bg border border-border dark:border-border/30 rounded-full px-4 py-2 hover:border-primary transition-all group"
          >
            <span className="font-medium text-foreground group-hover:text-primary transition-colors">
              #{label.name}
            </span>
            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
              {label.count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
