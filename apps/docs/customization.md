# 高级定制

本指南将介绍如何对您的博客进行个性化设置，包括添加“关于”页面、配置专栏识别以及自定义导航菜单。

## “关于我”页面

您可以轻松地为您的博客添加一个“关于我”页面。

1.  在您的内容仓库的**根目录**下，创建一个名为 `about.md` 的文件。
2.  在该文件中写入您的个人介绍，支持所有 Markdown 语法。

完成以上操作后，当 Action 下次运行时，会自动将此文件内容渲染到 `/about` 页面，并且在导航栏中（如果使用默认菜单）会自动显示一个“关于我”的链接。

如果您的仓库中没有 `about.md` 文件，`/about` 页面将显示 404，并且相关链接会自动隐藏。

## 专栏识别

本引擎可以自动将一系列相关的文章组织成“专栏”。我们提供了两种灵活的识别方式，并允许您通过环境变量进行配置。

### 方式一：基于标题分隔符 (推荐)

这是最精确的方式。您可以在文章标题中使用特定的分隔符来定义专栏。例如，对于以下两篇文章：

- `深入理解 React - Hooks 原理`
- `深入理解 React - Fiber 架构`

系统会自动将它们识别为属于 `深入理解 React` 这个专栏。

**可配置的分隔符:**

您可以通过 `COLUMN_DELIMITERS` 环境变量来自定义用于切分专栏名称的分隔符列表（用英文逗号 `,` 分隔）。

默认值是：`之,系列,-,（,(,）,)`

### 方式二：基于标题公共前缀

对于没有被分隔符匹配到的文章，系统会尝试寻找标题中足够长的公共前缀来识别专栏。

**可配置的最小文章数:**

您可以通过 `COLUMN_MIN_ARTICLES` 环境变量来设置一个专栏至少需要包含的文章数量，以避免错误的归类。

默认值是 `2`。

## 自定义导航菜单

您可以通过 `NEXT_PUBLIC_HEADER_CONFIG` 环境变量来完全重写顶部的导航菜单。

我们推荐在 GitHub Action 的 workflow 文件中使用 YAML 的多行字符串语法来配置，这样更清晰：

```yaml
# 在 .github/workflows/blog.yml 的 with: 块内
with:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  NEXT_PUBLIC_HEADER_CONFIG: |
    {
      "items": [
        { "type": "builtin", "text": "最新文章", "builtin": "latest" },
        { "type": "label", "text": "技术分享", "label": "技术" },
        { "type": "label", "text": "生活感悟", "label": "生活" },
        { "type": "builtin", "text": "所有专栏", "builtin": "columns" },
        { "type": "builtin", "text": "所有分类", "builtin": "categories" },
        { "type": "builtin", "text": "关于我", "builtin": "about" }
      ]
    }
```

### 菜单项 (`items`) 详解

- `type: "builtin"`: 用于链接到系统内置的核心页面。
  - `builtin`: 可选值为 `"latest"` (首页), `"categories"` (分类列表), `"columns"` (专栏列表), `"about"` (关于页面)。
  - `text`: 显示在导航栏上的文本。

- `type: "label"`: 用于链接到某个特定的文章分类页面。
  - `label`: 必须与您在 GitHub Issues 中使用的某个标签 (Label) 的名称完全匹配。
  - `text`: 显示在导航栏上的文本。