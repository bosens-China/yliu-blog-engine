import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { getBlogData } from "@/lib/data";
import fs from "node:fs";
import path from "node:path";
import clsx from "clsx";

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

  // 直接使用blog-data中的metadata，无论是AI生成的还是默认的
  const description = siteMetadata.description;
  const keywords = siteMetadata.keywords;

  const authorName = siteMetadata.author;
  const authorUrl = `https://github.com/${repoOwner}`;

  return {
    title: {
      default: defaultTitle,
      template: `%s - ${siteMetadata.title}`,
    },
    description: description,
    keywords: keywords,
    authors: [{ name: authorName, url: authorUrl }],
    metadataBase: new URL(siteMetadata.url),
    openGraph: {
      title: defaultTitle,
      description: description,
      url: siteMetadata.url,
      siteName: siteMetadata.title,
      locale: "zh_CN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: description,
      creator: `@${repoOwner}`,
    },
  };
}

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
        className={clsx(
          geistSans.variable,
          geistMono.variable,
          'antialiased bg-background text-foreground min-h-screen flex flex-col',
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
