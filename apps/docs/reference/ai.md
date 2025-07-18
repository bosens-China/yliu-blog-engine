# AI 增强配置

通过配置 AI 服务，可以自动优化文章的 SEO、生成专栏摘要等。

## 服务端点

您需要为不同的 AI 功能提供服务端点（例如 Dify 的工作流 URL）和对应的 API Key。

| 变量名                 | 描述                                   | 是否必填 | 默认值 |
| ---------------------- | -------------------------------------- | -------- | ------ |
| `AI_POSTS_SEO_URL`     | **文章 SEO 优化** 的 AI 服务 URL。     | 否       | (空)   |
| `AI_POSTS_SEO_API_KEY` | **文章 SEO 优化** 的 AI 服务 API Key。 | 否       | (空)   |
| `AI_COLUMNS_URL`       | **专栏分析总结** 的 AI 服务 URL。      | 否       | (空)   |
| `AI_COLUMNS_API_KEY`   | **专栏分析总结** 的 AI 服务 API Key。  | 否       | (空)   |
| `AI_SITE_SEO_URL`      | **全站 SEO 汇总** 的 AI 服务 URL。     | 否       | (空)   |
| `AI_SITE_SEO_API_KEY`  | **全站 SEO 汇总** 的 AI 服务 API Key。 | 否       | (空)   |

## 性能与限制

这些参数用于微调 AI 请求的行为，以适应不同服务商的限制或控制成本。

| 变量名                        | 描述                                                   | 是否必填 | 默认值  |
| ----------------------------- | ------------------------------------------------------ | -------- | ------- |
| `AI_MAX_CHARS_PER_BATCH`      | 单个批次中所有文章内容的总字符数上限。                 | 否       | `50000` |
| `AI_SINGLE_ARTICLE_THRESHOLD` | 单篇文章超过此字符数阈值，将被单独批次处理。           | 否       | `40000` |
| `AI_MAX_ARTICLES_PER_BATCH`   | 单个批次中包含的最大文章数量。                         | 否       | `15`    |
| `AI_ARTICLE_TRUNCATE_LENGTH`  | 为避免超长，输入给 AI 的单篇文章内容将被截断到此长度。 | 否       | `45000` |
