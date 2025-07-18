# 定制化配置

这些变量用于定制您博客的外观、内容处理和路由。

## 站点信息

| 变量名                      | 描述                                                                         | 是否必填 | 默认值             |
| --------------------------- | ---------------------------------------------------------------------------- | -------- | ------------------ |
| `NEXT_PUBLIC_BLOG_TITLE`    | 博客的主标题。                                                               | 否       | 仓库名称           |
| `NEXT_PUBLIC_BLOG_AUTHOR`   | 作者的名称。                                                                 | 否       | 仓库所有者         |
| `NEXT_PUBLIC_FOOTER_TEXT`   | 显示在页面底部的页脚文本。                                                   | 否       | (空)               |
| `NEXT_PUBLIC_HEADER_CONFIG` | 用于自定义顶部导航菜单的 JSON 字符串。详见 [高级定制](../customization.md)。 | 否       | (自动生成基础菜单) |

## 内容处理

| 变量名                     | 描述                                                  | 是否必填 | 默认值                |
| -------------------------- | ----------------------------------------------------- | -------- | --------------------- |
| `COLUMN_DELIMITERS`        | 用于识别专栏的标题分隔符列表（用英文逗号 `,` 分隔）。 | 否       | `之,系列,-,（,(,）,)` |
| `COLUMN_MIN_ARTICLES`      | 一个专栏至少需要包含的文章数量。                      | 否       | `2`                   |
| `COLUMN_MIN_PREFIX_LENGTH` | 识别专栏时标题所需的最短公共前缀。                    | 否       | `6`                   |

## 路由配置

| 变量名                  | 描述                                                         | 是否必填 | 默认值                                 |
| ----------------------- | ------------------------------------------------------------ | -------- | -------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`  | 站点的完整根 URL，用于生成 SEO 元数据。                      | 否       | (根据仓库名和 GitHub Pages 域名自动生成) |
| `NEXT_PUBLIC_BASE_PATH` | 如果您希望将站点部署在子目录下（例如 `/blog`），请设置此项。 | 否       | (根据仓库名自动生成)                   |
