import Ajv from "ajv";
import type { JSONSchemaType } from "ajv";
import enhancePostsSchema from "@/config/ai/enhance-posts-schema.json";
import enhanceSiteSchema from "@/config/ai/enhance-site-schema.json";

const ajv = new Ajv();

// --- 公共类型定义 ---

export interface SiteMeta {
  description: string;
  keywords: string[];
}

export interface Column {
  name: string;
  post_ids: number[];
}

export interface SiteEnhancements {
  site_meta: SiteMeta;
  columns: Column[];
}

export interface PostEnhancement {
  id: string;
  summary: string;
  keywords: string[];
}

export type PostForAI = { id: number; title: string; content: string };

// --- AI 服务 ---

interface DifyCompletionResponse {
  task_id: string;
  data: {
    status: "succeeded" | "failed" | "stopped";
    outputs?: {
      answer?: string;
      result?: unknown; // Dify's 'result' can be anything
    };
    error?: string;
  };
}

interface DifyErrorResponse {
  status: number;
  code: string;
  message: string;
}

export class AIEnhancerService {
  private siteApiKey?: string;
  private postsApiKey?: string;
  private siteWorkflowUrl?: string;
  private postsWorkflowUrl?: string;
  private userId: string;

  constructor() {
    this.siteApiKey = process.env.AI_SITE_API_KEY;
    this.postsApiKey = process.env.AI_POSTS_API_KEY;
    this.siteWorkflowUrl = process.env.AI_SITE_WORKFLOW_URL;
    this.postsWorkflowUrl = process.env.AI_POSTS_WORKFLOW_URL;
    this.userId = process.env.AI_USER_ID || "blog-engine-user";
  }

  public hasSiteWorkflowConfigured(): boolean {
    return !!this.siteWorkflowUrl && !!this.siteApiKey;
  }

  public hasPostsWorkflowConfigured(): boolean {
    return !!this.postsWorkflowUrl && !!this.postsApiKey;
  }

  private async callWorkflowAPI<T>(
    workflowUrl: string,
    apiKey: string,
    inputs: Record<string, string>,
    schema: JSONSchemaType<T>
  ): Promise<T | null> {
    try {
      const response = await fetch(workflowUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs,
          response_mode: "blocking",
          user: this.userId,
        }),
      });

      const result = await response.json();

      if (response.status >= 400 || (result.status && result.status >= 400)) {
        const error = result as DifyErrorResponse;
        console.warn(
          `️️⚠️ AI workflow call failed with status ${response.status} (${
            error.code || "N/A"
          }): ${error.message || "Unknown error"}`
        );
        return null;
      }

      const completionData = result as DifyCompletionResponse;
      if (completionData.data.status !== "succeeded") {
        console.warn(
          `️️⚠️ AI workflow did not succeed: Status [${
            completionData.data.status
          }], Error: ${completionData.data.error || "N/A"}`
        );
        return null;
      }

      // Try to get the answer from different possible locations
      const answerSource =
        completionData.data.outputs?.answer ||
        completionData.data.outputs?.result;
      if (!answerSource) {
        console.warn(
          `️️⚠️ AI response format is unexpected. Could not find a valid output.`,
          result
        );
        return null;
      }

      const parsedAnswer =
        typeof answerSource === "string"
          ? JSON.parse(answerSource)
          : answerSource;
      const validate = ajv.compile(schema);

      if (!validate(parsedAnswer)) {
        console.warn(
          `️️⚠️ AI response failed schema validation:`,
          validate.errors
        );
        return null;
      }

      return parsedAnswer as T;
    } catch (error) {
      console.warn(`⚠️ Error calling AI workflow:`, error);
      return null;
    }
  }

  public async enhanceSite(
    titles: string[],
    labels: string[],
    postIds: number[]
  ): Promise<SiteEnhancements | null> {
    if (!this.siteWorkflowUrl || !this.siteApiKey) return null;
    console.log("🤖 Calling AI 'site enhancement' workflow...");

    const inputs = {
      titles: JSON.stringify(titles),
      labels: JSON.stringify(labels),
      post_ids: JSON.stringify(postIds),
    };

    return this.callWorkflowAPI(
      this.siteWorkflowUrl,
      this.siteApiKey,
      inputs,
      enhanceSiteSchema as JSONSchemaType<SiteEnhancements>
    );
  }

  public async enhancePosts(
    posts: PostForAI[]
  ): Promise<PostEnhancement[] | null> {
    if (!this.postsWorkflowUrl || !this.postsApiKey) return null;
    console.log(
      `🤖 Calling AI 'posts enhancement' workflow for ${posts.length} posts...`
    );

    const inputs = {
      posts: JSON.stringify(posts),
    };

    return this.callWorkflowAPI(
      this.postsWorkflowUrl,
      this.postsApiKey,
      inputs,
      enhancePostsSchema as JSONSchemaType<PostEnhancement[]>
    );
  }
}
