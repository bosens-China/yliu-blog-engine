import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTopButton from "@/components/BackToTopButton";
import { getBlogData } from "@/lib/data";
import fs from "node:fs";
import path from "node:path";

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
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const { metadata: siteMetadata } = getBlogData();
  const repoOwner = siteMetadata.repository.split("/")[0];

  const defaultTitle = `${siteMetadata.title} - ${siteMetadata.description}`;
  const defaultDescription =
    process.env.NEXT_PUBLIC_SEO_DESCRIPTION || siteMetadata.description;
  const defaultKeywords = process.env.NEXT_PUBLIC_SEO_KEYWORDS
    ? process.env.NEXT_PUBLIC_SEO_KEYWORDS.split(",").map((k) => k.trim())
    : ["blog", "tech", "code", "ai"];
  const authorName = process.env.NEXT_PUBLIC_BLOG_AUTHOR || repoOwner;
  const authorUrl = `https://github.com/${repoOwner}`;

  return {
    title: {
      default: defaultTitle,
      template: `%s - ${siteMetadata.title}`,
    },
    description: defaultDescription,
    keywords: defaultKeywords,
    authors: [{ name: authorName, url: authorUrl }],
    metadataBase: new URL(siteMetadata.url),
    openGraph: {
      title: defaultTitle,
      description: defaultDescription,
      url: siteMetadata.url,
      siteName: siteMetadata.title,
      locale: "zh_CN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: defaultDescription,
      creator: `@${repoOwner}`,
    },
  };
}

// 动态检测并设置 favicon
function getFaviconLinks(): { rel: string; url: string; type?: string }[] {
  const publicPath = path.join(process.cwd(), "public");
  const defaultIcon = {
    rel: "icon",
    url: "/favicon.ico",
    type: "image/x-icon",
  };

  if (fs.existsSync(path.join(publicPath, "favicon.svg"))) {
    return [{ rel: "icon", url: "/favicon.svg", type: "image/svg+xml" }];
  }
  if (fs.existsSync(path.join(publicPath, "favicon.png"))) {
    return [{ rel: "icon", url: "/favicon.png", type: "image/png" }];
  }

  return [defaultIcon];
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const faviconLinks = getFaviconLinks();
  return (
    <html lang="zh-CN" suppressHydrationWarning className="scroll-smooth">
      <head>
        {faviconLinks.map((link) => (
          <link
            key={link.url}
            rel={link.rel}
            href={link.url}
            type={link.type}
          />
        ))}
      </head>
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
