import { Footer, Layout, Navbar } from 'nextra-theme-docs';
import { Banner, Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import { ThemeProvider } from 'next-themes';
import 'nextra-theme-docs/style.css';
import React from 'react';

/* ---------- 1. 站点级元数据 ---------- */
export const metadata = {
  title: {
    template: '%s | Yliu Blog Engine',
    default: 'Yliu Blog Engine',
  },
  description:
    '基于 GitHub Issues 的现代化、高性能博客引擎。零配置，AI 增强，专为开发者打造。',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://bosens-China.github.io/yliu-blog-engine',
    siteName: 'Yliu Blog Engine',
    images: '/og.png',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@bosensChina',
  },
};

/* ---------- 2. 构造导航 ---------- */
const banner = (
  <Banner storageKey="docs-v1">
    🎉 博客引擎 v1 已发布，5 分钟拥有自己的博客！
  </Banner>
);

const navbar = (
  <Navbar
    logo={
      <b className="text-xl font-bold">
        Yliu<span className="text-blue-600">Blog</span>
      </b>
    }
    projectLink="https://github.com/bosens-China/yliu-blog-engine"
  />
);

const footer = (
  <Footer>
    <span>MIT © {new Date().getFullYear()} bosens-China</span>
  </Footer>
);

/* ---------- 3. 根布局 ---------- */
// eslint-disable-next-line react/prop-types
export default async function RootLayout({ children }) {
  const pageMap = await getPageMap();

  return (
    <html lang="zh-CN" dir="ltr" suppressHydrationWarning /* next-themes */>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <body>
        {/* 暗色模式 Provider */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Layout
            banner={banner}
            navbar={navbar}
            pageMap={pageMap}
            docsRepositoryBase="https://github.com/bosens-China/yliu-blog-engine/tree/main/apps/docs"
            footer={footer}
            editLink="在 GitHub 上编辑此页 →"
          >
            {children}
          </Layout>
        </ThemeProvider>
      </body>
    </html>
  );
}
