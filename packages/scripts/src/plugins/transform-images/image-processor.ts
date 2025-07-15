import path from 'node:path';
import crypto from 'node:crypto';
import fse from 'fs-extra';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import type { Image } from 'mdast';
import type { Post } from '@yliu/types/blog';
import type { CacheManager } from '@/core/cache';
import { log, warn } from '@/utils/logger';

const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36';

export class ImageProcessor {
  private cache: CacheManager;
  private siteUrl: string;
  private publicDir: string;
  private urlReplacements: Map<string, string>;

  constructor(cache: CacheManager, siteUrl: string, publicDir: string) {
    this.cache = cache;
    this.siteUrl = siteUrl;
    this.publicDir = publicDir;
    this.urlReplacements = new Map();
  }

  public async process(posts: Post[]): Promise<Post[]> {
    log('🖼️ 开始批量处理文章图片...');
    await fse.ensureDir(this.publicDir);

    const allImages = this.extractAllImages(posts);
    if (allImages.length === 0) {
      log('未在文章中发现外部图片，跳过处理。');
      return posts;
    }

    const domainGroups = this.groupImagesByDomain(allImages);
    log(
      `发现 ${allImages.length} 张图片，来自 ${domainGroups.size} 个不同域名。`,
    );

    // 对每个域名的处理也可以并发
    const domainProcessingTasks = Array.from(domainGroups.entries()).map(
      async ([domain, images]) => {
        const firstImageUrl = images[0]?.url;
        if (!firstImageUrl) return;

        const requiresProcessing = await this.isHotlinkProtected(
          domain,
          firstImageUrl,
        );
        if (requiresProcessing) {
          log(
            `⬇️ 域名 [${domain}] 需要处理，开始并发下载 ${images.length} 张图片...`,
          );
          await this.processDomainImages(images);
        } else {
          log(`✅ 域名 [${domain}] 无需处理，跳过。`);
        }
      },
    );
    await Promise.all(domainProcessingTasks);

    if (this.urlReplacements.size === 0) {
      log('图片处理完成，没有链接被替换。');
      return posts;
    }

    log('图片处理完成，正在应用链接替换...');
    return this.applyReplacements(posts);
  }

  // --- 关键修改点：改为并发下载 ---
  private async processDomainImages(images: { url: string }[]): Promise<void> {
    const downloadTasks = images.map(async (image) => {
      const { localPath, publicPath } = this.generateLocalImagePath(image.url);

      if (await fse.pathExists(localPath)) {
        // log(`  [跳过] 图片已存在: ${publicPath}`);
      } else {
        try {
          await this.downloadImage(image.url, localPath);
          log(`  [成功] 下载: ${image.url}`);
        } catch (error: unknown) {
          warn(`  [失败] 下载 ${image.url}: ${(error as Error).message}`);
          await fse.unlink(localPath).catch(() => {});
          return; // 出错时，不设置 urlReplacements
        }
      }
      // 使用 this.urlReplacements.set 是线程安全的，因为 Map 的 set 不是异步操作
      this.urlReplacements.set(image.url, publicPath);
    });

    // 并发执行当前域名的所有下载任务
    await Promise.all(downloadTasks);
  }

  // --- 其他方法保持不变 ---

  private extractAllImages(
    posts: Post[],
  ): { url: string; postIndex: number }[] {
    const images: { url: string; postIndex: number }[] = [];
    posts.forEach((post, postIndex) => {
      if (!post.content) return;
      const tree = unified().use(remarkParse).parse(post.content);
      visit(tree, 'image', (node: Image) => {
        if (
          node.url &&
          (node.url.startsWith('http://') || node.url.startsWith('https://'))
        ) {
          images.push({ url: node.url, postIndex });
        }
      });
    });
    return images;
  }

  private groupImagesByDomain(
    images: { url: string }[],
  ): Map<string, { url: string }[]> {
    const groups = new Map<string, { url: string }[]>();
    for (const image of images) {
      try {
        const domain = new URL(image.url).hostname;
        if (!groups.has(domain)) {
          groups.set(domain, []);
        }
        groups.get(domain)!.push(image);
      } catch (e: unknown) {
        warn(`解析图片URL失败: ${image.url} - ${(e as Error).message}`);
      }
    }
    return groups;
  }

  private async isHotlinkProtected(
    domain: string,
    sampleUrl: string,
  ): Promise<boolean> {
    const hotlinkDomains = this.cache.get('hotlinkDomains') || {};
    if (typeof hotlinkDomains[domain] === 'boolean') {
      log(
        `[缓存命中] 域名 ${domain} 防盗链状态: ${hotlinkDomains[domain] ? '是' : '否'}`,
      );
      return hotlinkDomains[domain];
    }

    log(`[缓存未命中] 正在探测域名 ${domain} 的防盗链策略...`);
    try {
      const resWithReferer = await fetch(sampleUrl, {
        method: 'HEAD',
        headers: { Referer: this.siteUrl, 'User-Agent': BROWSER_USER_AGENT },
      }).catch(() => null);
      if (resWithReferer && resWithReferer.ok) {
        log(`[探测✓] ${domain} 无需处理。`);
        hotlinkDomains[domain] = false;
        this.cache.set('hotlinkDomains', hotlinkDomains);
        return false;
      }
      warn(
        `[探测!] ${domain} 可能存在防盗链 (带Referer请求失败)，尝试无 Referer 下载...`,
      );
      const resWithoutReferer = await fetch(sampleUrl, {
        method: 'HEAD',
        headers: { 'User-Agent': BROWSER_USER_AGENT },
      }).catch(() => null);
      if (resWithoutReferer && resWithoutReferer.ok) {
        log(`[探测✓] ${domain} 确认需要处理。`);
        hotlinkDomains[domain] = true;
        this.cache.set('hotlinkDomains', hotlinkDomains);
        return true;
      }
      warn(
        `[探测✗] ${domain} 无法访问 (两种方式都失败)，将跳过该域名下的所有图片。`,
      );
      hotlinkDomains[domain] = false;
      this.cache.set('hotlinkDomains', hotlinkDomains);
      return false;
    } catch (e: unknown) {
      warn(
        `探测图片 ${sampleUrl} 时发生未知错误，跳过: ${(e as Error).message}`,
      );
      return false;
    }
  }

  private generateLocalImagePath(url: string) {
    try {
      const parsedUrl = new URL(url);
      const fileExtension = path.extname(parsedUrl.pathname) || '.png';
      const hash = crypto
        .createHash('sha256')
        .update(url)
        .digest('hex')
        .substring(0, 16);
      const localFilename = `${hash}${fileExtension}`;
      return {
        localPath: path.join(this.publicDir, localFilename),
        publicPath: `/images/downloaded/${localFilename}`,
      };
    } catch {
      const hash = crypto
        .createHash('sha256')
        .update(url)
        .digest('hex')
        .substring(0, 16);
      return {
        localPath: path.join(this.publicDir, `${hash}.png`),
        publicPath: `/images/downloaded/${hash}.png`,
      };
    }
  }

  private async downloadImage(url: string, localPath: string): Promise<void> {
    const response = await fetch(url, {
      headers: { 'User-Agent': BROWSER_USER_AGENT },
    });
    if (!response.ok || !response.body) {
      throw new Error(`下载失败 (${response.status} ${response.statusText})`);
    }
    const writer = fse.createWriteStream(localPath);
    const body: ReadableStream<Uint8Array> = response.body;
    const reader = body.getReader();

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
      const pump = () => {
        reader
          .read()
          .then(({ done, value }) => {
            if (done) {
              writer.end();
              return;
            }
            if (value) {
              writer.write(value, (error) => {
                if (error) {
                  reject(error);
                  return;
                }
                pump();
              });
            } else {
              pump();
            }
          })
          .catch(reject);
      };
      pump();
    });
  }

  private applyReplacements(posts: Post[]): Post[] {
    return posts.map((post) => {
      if (!post.content) return post;
      let newContent = post.content;
      for (const [originalUrl, localPath] of this.urlReplacements.entries()) {
        newContent = newContent.replaceAll(originalUrl, localPath);
      }
      return { ...post, content: newContent };
    });
  }
}
