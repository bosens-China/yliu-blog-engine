import fs from "node:fs";
import path from "node:path";
import type { PostForAI } from "@/lib/ai";
import type { BlogData } from "@/types";
import type { DifyCache } from "./types";

/**
 * 将最终的博客数据写入 blog-data.json 文件
 * @param data BlogData
 */
export function writeBlogData(data: BlogData): void {
  const outputPath = path.join(process.cwd(), "src/data/blog-data.json");
  // 确保目录存在
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  console.log(`✍️ 正在将最终数据写入 ${outputPath}`);
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log("✅ 博客数据已成功写入。");
}

/**
 * 将给 AI 使用的数据写入文件以供调试
 * @param data PostForAI[] | null
 */
export function writeAIDataForDebug(data: PostForAI[] | null): void {
  if (!data) return;
  const outputPath = path.join(process.cwd(), "src/data/blog-data-for-ai.json");
  // 确保目录存在
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  console.log(`🐞 正在将 AI 调试数据写入 ${outputPath}`);
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log("✅ AI 调试数据已成功写入。");
}

const DIFY_CACHE_PATH = path.join(process.cwd(), "src/data/dify-cache.json");

/**
 * 读取 Dify 缓存文件
 * @returns DifyCache | null
 */
export function readDifyCache(): DifyCache | null {
  if (!fs.existsSync(DIFY_CACHE_PATH)) {
    console.log("💡 未找到 Dify 缓存文件，将执行完整构建。");
    return null;
  }
  try {
    console.log(`📦 正在读取 Dify 缓存文件: ${DIFY_CACHE_PATH}`);
    const cacheData = fs.readFileSync(DIFY_CACHE_PATH, "utf-8");
    return JSON.parse(cacheData) as DifyCache;
  } catch (error) {
    console.warn("⚠️ 读取或解析 Dify 缓存失败，将执行完整构建。", error);
    return null;
  }
}

/**
 * 将最新的 AI 增强数据写入缓存文件
 * @param cache DifyCache
 */
export function writeDifyCache(cache: DifyCache): void {
  try {
    console.log(`💾 正在更新 Dify 缓存文件: ${DIFY_CACHE_PATH}`);
    fs.mkdirSync(path.dirname(DIFY_CACHE_PATH), { recursive: true });
    fs.writeFileSync(DIFY_CACHE_PATH, JSON.stringify(cache, null, 2));
    console.log("✅ Dify 缓存已成功更新。");
  } catch (error) {
    console.warn("⚠️ 写入 Dify 缓存失败。", error);
  }
}
