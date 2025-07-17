# AI 增强

通过集成 AI 服务，您可以将您的博客提升到一个新的水平，实现内容的自动化 SEO 优化和智能组织。

## 功能概览

我们目前提供三大独立的 AI 功能，您可以选择性地开启一项或多项。

| 功能               | 描述                                                     |
| ------------------ | -------------------------------------------------------- |
| **文章 SEO 优化**  | 为每篇文章自动生成更具吸引力的标题、摘要和 SEO 关键词。    |
| **专栏智能分析**   | 自动分析所有文章，将内容相关的文章组织成专栏系列。       |
| **全站 SEO 汇总**  | 基于所有文章内容，为您的整个博客生成一个全局的、一致的 SEO 策略。 |

## 快速配置

要启用 AI 功能，您需要在您的 workflow 文件中配置相应的环境变量。以下是一个包含了所有 AI 相关配置的示例：

```yaml
# 在 .github/workflows/blog.yml 的 with: 块内
with:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  # [必需] 全局开启 AI 处理
  AI_ENABLE_PROCESSING: true

  # --- 文章 SEO 优化 ---
  AI_POSTS_SEO_URL: "https://your-dify-url.com/workflows/xxxx/run"
  AI_POSTS_SEO_API_KEY: ${{ secrets.AI_API_KEY }}

  # --- 专栏智能分析 ---
  AI_COLUMNS_URL: "https://your-dify-url.com/workflows/yyyy/run"
  AI_COLUMNS_API_KEY: ${{ secrets.AI_API_KEY }} # 如果 Key 相同，可复用

  # --- 全站 SEO 汇总 ---
  AI_SITE_SEO_URL: "https://your-dify-url.com/workflows/zzzz/run"
  AI_SITE_SEO_API_KEY: ${{ secrets.AI_API_KEY }} # 如果 Key 相同，可复用
```

## Dify 工作流配置详解

如果您希望使用 Dify 来实现这些 AI 功能，以下是详细的配置步骤，包括每个工作流所需的提示词 (Prompt) 和输出的 JSON Schema。这些内容直接从代码库的源文件中复制而来，保证与实际执行的代码完全一致。

<details>
<summary>点击展开：文章 SEO 优化 (Posts SEO)</summary>

#### **提示词 (Prompt)**

```txt
**角色**: 你是一位顶级的SEO专家和内容分析师。

**任务**: 处理一批以JSON格式提供的文章数据。你需要为每篇文章生成独立的SEO元信息。

**工作流程**:

1.  **逐篇分析**: 遍历输入的 `articles` 数组。对每篇文章，根据其标题 (`title`)、内容 (`content`) 和标签 (`labels`) 生成 `description`, `keywords`, 和 `tags`。
2.  **严格遵循格式**: 输出必须是严格符合我提供的 JSON Schema 的单个 JSON 对象。

**输入格式**:
一个 JSON 字符串，其结构为 `{ "articles": [{ "id": ..., "title": ..., "content": ..., "labels": [...] }] }`

**输出格式**:
严格遵循 JSON Schema，返回一个包含 `articles_seo` 数组的 JSON。

**请处理以下文章批次**:

```json
{{#articles#}}
```

```

#### **输出 (JSON Schema)**

```json
{
  "type": "object",
  "properties": {
    "articles_seo": {
      "type": "array",
      "description": "每篇文章的SEO优化结果",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer",
            "description": "文章的原始数字ID"
          },
          "optimized_title": {
            "type": "string",
            "description": "SEO优化后的标题（50字符内）",
            "maxLength": 50
          },
          "description": {
            "type": "string",
            "description": "文章的元描述（150字符左右）",
            "maxLength": 160
          },
          "keywords": {
            "type": "array",
            "description": "5-8个核心关键词",
            "items": {
              "type": "string"
            }
          },
          "tags": {
            "type": "array",
            "description": "3-5个分类标签",
            "items": {
              "type": "string"
            }
          }
        },
        "required": [
          "id",
          "optimized_title",
          "description",
          "keywords",
          "tags"
        ]
      }
    },
    "batch_summary": {
      "type": "object",
      "description": "对本次处理批次的宏观分析总结",
      "properties": {
        "common_themes": {
          "type": "array",
          "description": "在这批文章中识别出的共同主题",
          "items": {
            "type": "string"
          }
        },
        "overall_sentiment": {
          "type": "string",
          "description": "这批文章的整体情感基调 (例如: 教学性, 探索性, 批判性)"
        }
      },
      "required": [
        "common_themes",
        "overall_sentiment"
      ]
    }
  },
  "required": [
    "articles_seo",
    "batch_summary"
  ]
}
```

</details>

<details>
<summary>点击展开：专栏智能分析 (Columns Analysis)</summary>

#### **提示词 (Prompt)**

```txt
**角色**: 你是一位资深的内容策划师，擅长从文章标题列表中发现内在联系，将相关内容组织成系列专栏。

**任务**: 分析给出的文章列表（包含ID和标题），识别并创建专栏。每个专栏应包含至少2篇主题相关的文章。

**工作流程**:

1.  **分析标题**: 理解每个标题的核心主题。
2.  **识别系列**: 找出具有明显关联或共同主题的标题。
3.  **构建专栏**: 为每个识别出的系列创建一个专栏对象。

**限制**:

- 专栏名称要精炼，描述要清晰。
- 同一篇文章只归属于一个最合适的专栏。
- 如果找不到任何合适的专栏，返回一个空的 "columns" 数组。

**输入格式**:
一个 JSON 字符串，其结构为 `{ "articles": [{ "id": ..., "title": ... }] }`

**请分析以下文章列表**:

```json
{{#articles#}}
```

```

#### **输出 (JSON Schema)**

```json
{
  "type": "object",
  "properties": {
    "columns": {
      "type": "array",
      "description": "识别出的专栏列表",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "专栏的名称，简洁有吸引力"
          },
          "description": {
            "type": "string",
            "description": "对专栏的简短描述，说明其主题或价值"
          },
          "article_ids": {
            "type": "array",
            "description": "属于该专栏的文章 ID 列表",
            "minItems": 2,
            "items": {
              "type": "integer",
              "description": "文章的数字 ID"
            }
          }
        },
        "required": [
          "name",
          "description",
          "article_ids"
        ]
      }
    }
  },
  "required": [
    "columns"
  ]
}
```

</details>

<details>
<summary>点击展开：全站 SEO 汇总 (Site SEO)</summary>

#### **提示词 (Prompt)**

```txt
**角色**: 你是一位品牌策略专家和顶尖SEO顾问。

**任务**: 基于一个网站所有文章的SEO数据（关键词和标签），提炼并生成代表整个网站身份的核心元信息。

**工作流程**:

1.  **数据分析**: 分析输入的所有文章的 `keywords` 和 `tags`，找出最高频、最重要的主题。
2.  **品牌定位**: 基于这些主题，确定网站的核心价值和品牌形象。
3.  **元信息生成**: 创建 `site_meta` 对象。

**输入格式**:
一个 JSON 字符串，其结构为 `{ "all_articles_seo": [{ "keywords": [...], "tags": [...] }] }`

**请分析以下全站文章的SEO数据**:

```json
{{#all_articles_seo#}}
```

```

#### **输出 (JSON Schema)**

```json
{
  "type": "object",
  "properties": {
    "site_meta": {
      "type": "object",
      "description": "用于网站全局<meta>标签的核心SEO信息",
      "properties": {
        "title": {
          "type": "string",
          "description": "网站主标题 (例如：张三的博客)"
        },
        "description": {
          "type": "string",
          "description": "网站的全局元描述 (160字符内)"
        },
        "keywords": {
          "type": "array",
          "description": "代表整个网站的10-15个核心关键词",
          "items": {
            "type": "string"
          }
        },
        "tagline": {
          "type": "string",
          "description": "网站的品牌标语或口号 (20字符内)"
        }
      },
      "required": [
        "title",
        "description",
        "keywords",
        "tagline"
      ]
    }
  },
  "required": [
    "site_meta"
  ]
}
```

</details>

## 关于平台兼容性 (鸭子类型)

我们内置的脚本已针对开源 LLM 平台 [Dify](https://dify.ai/) 的 API 格式进行了优化。但是，我们遵循“鸭子类型”原则，并未锁定任何特定平台。

如果您希望使用其他 AI 服务（例如 [Coze](https://www.coze.com/)、[FastGPT](https://fastgpt.in/) 或您自建的服务），完全可行。您只需确保您的 API 能够接收我们发送的 JSON 输入，并能返回与上述 **JSON Schema** 完全一致的 JSON 输出即可。如果一个服务“看起来像鸭子，叫起来像鸭子”，那我们就会把它当作一只鸭子来处理。