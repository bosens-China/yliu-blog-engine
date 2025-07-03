import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">页面未找到</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        抱歉，您访问的页面不存在或已被移除。请检查URL是否正确，或返回首页继续浏览。
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        返回首页
      </Link>
    </div>
  );
}
