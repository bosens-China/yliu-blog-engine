import "dotenv/config";
import type { GithubIssue } from "./types";

// 读取 README.md 中定义的环境变量
const GITHUB_REPOSITORY = process.env.NEXT_PUBLIC_GITHUB_REPOSITORY || "";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // 允许为空

export async function fetchGitHubIssues(): Promise<GithubIssue[]> {
  if (!GITHUB_REPOSITORY) {
    throw new Error("❌ 缺少必需的环境变量: NEXT_PUBLIC_GITHUB_REPOSITORY");
  }

  const [owner, repo] = GITHUB_REPOSITORY.split("/");

  if (!owner || !repo) {
    throw new Error(
      '❌ NEXT_PUBLIC_GITHUB_REPOSITORY 格式无效，期望的格式是 "owner/repo"'
    );
  }

  console.log(`📡 正在从 https://github.com/${owner}/${repo} 拉取 issues...`);

  const allIssues: GithubIssue[] = [];
  let page = 1;
  const perPage = 100; // 使用 API 允许的最大值

  while (true) {
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
    };

    if (GITHUB_TOKEN) {
      headers["Authorization"] = `token ${GITHUB_TOKEN}`;
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?per_page=${perPage}&page=${page}`,
      {
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        `拉取 issues 失败 (Page ${page}): ${response.statusText}`
      );
    }

    const issues: GithubIssue[] = await response.json();
    if (issues.length === 0) {
      // 没有更多 issues 了，退出循环
      break;
    }

    allIssues.push(...issues);
    page++;
  }

  console.log(`✅ 成功拉取 ${allIssues.length} 个 issues。`);
  return allIssues;
}
