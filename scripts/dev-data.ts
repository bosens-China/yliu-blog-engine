import "dotenv/config";

import type { PostForAI } from "@/lib/ai";
import { writeAIDataForDebug } from "./lib/file-writer";
import { fetchGitHubIssues } from "./lib/github";
import { extractPost, isPost } from "./lib/processor";

/**
 * 开发环境构建脚本
 * - 仅获取和处理用于 AI 调试的数据
 * - 写入用于调试的 blog-data-for-ai.json
 */
async function dev() {
  try {
    console.log("🚀 开始开发环境数据构建 (仅生成 AI 调试文件)...");

    // 1. 从 GitHub 拉取原始 Issues
    const issues = await fetchGitHubIssues();

    // 2. 将 Issues 初步处理为 Post 对象
    const initialPosts = issues.filter(isPost).map(extractPost);
    console.log(`📝 从 issues 中找到 ${initialPosts.length} 篇有效文章。`);

    // 3. 为 AI 调用准备数据
    console.log("📝 正在为 AI 调用准备数据 (精简字段)...");
    const postsForAI: PostForAI[] = initialPosts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content || "",
    }));
    console.log("✅ AI 数据准备完毕。");

    // 4. 仅写入供 AI 调试用的数据
    writeAIDataForDebug(postsForAI);
  } catch (error) {
    console.error("❌ 开发数据构建失败:");
    console.error(error);
    process.exit(1);
  }
}

dev();
