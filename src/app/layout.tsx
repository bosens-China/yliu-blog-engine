import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTopButton from "@/components/BackToTopButton";
import { getBlogData } from "@/lib/data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F9F9F9" },
    { media: "(prefers-color-scheme: dark)", color: "#0F1729" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const { labels, metadata: blogMetadata } = getBlogData();
  const repoOwner = blogMetadata.repository.split("/")[0];

  const title = process.env.NEXT_PUBLIC_BLOG_TITLE || `${repoOwner}的博客`;
  const description =
    process.env.NEXT_PUBLIC_BLOG_DESCRIPTION ||
    `由 ${repoOwner} 创建的个人技术博客，专注于分享知识和经验。`;
  const authorName = process.env.NEXT_PUBLIC_BLOG_AUTHOR || repoOwner;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const keywords = [
    ...new Set([
      "技术博客",
      "前端开发",
      "后端开发",
      ...labels.map((l) => l.name),
    ]),
  ];

  // 智能图标配置
  function getIconConfig() {
    // 1. 优先使用环境变量中的图标
    if (process.env.NEXT_PUBLIC_ICON_URL) {
      return {
        icon: process.env.NEXT_PUBLIC_ICON_URL,
        apple: process.env.NEXT_PUBLIC_ICON_URL,
      };
    }

    // 2. 尝试使用仓库根目录的 favicon.ico
    const repoFavicon = `https://raw.githubusercontent.com/${blogMetadata.repository}/main/favicon.ico`;

    // 3. 使用默认图标作为兜底
    return {
      icon: [
        { url: repoFavicon, sizes: "any" },
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.png", type: "image/png", sizes: "32x32" },
      ],
      apple: "/apple-icon.png",
    };
  }

  return {
    metadataBase: new URL(siteUrl),
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    description,
    keywords,
    authors: [{ name: authorName, url: `https://github.com/${repoOwner}` }],
    creator: authorName,
    publisher: authorName,
    icons: getIconConfig(),
    openGraph: {
      type: "website",
      locale: "zh_CN",
      url: "/",
      title,
      description,
      siteName: title,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-4">
              {children}
            </main>
            <Footer />
            <BackToTopButton />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
