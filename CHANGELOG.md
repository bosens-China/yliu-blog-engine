# Changelog

## [1.10.0](https://github.com/bosens-China/yliu-blog-engine/compare/root-v1.9.0...root-v1.10.0) (2025-08-08)


### Features

* 完成agent的编写 ([51c1224](https://github.com/bosens-China/yliu-blog-engine/commit/51c1224041912acc1e5522d6e9993bb25de19008))
* 新增 agent_blog 项目的基础功能，包括 FastAPI 服务器、文章输入和 SEO 生成工具，更新依赖项和配置文件 ([99ca660](https://github.com/bosens-China/yliu-blog-engine/commit/99ca660bb2ddd590b95cab4a6415752b16e684a1))

## [1.9.0](https://github.com/bosens-China/yliu-blog-engine/compare/root-v1.8.1...root-v1.9.0) (2025-07-31)


### Features

* 在 release-please 配置中新增 agent_blog 项目，设置为 Python 版本 ([5a15c25](https://github.com/bosens-China/yliu-blog-engine/commit/5a15c25cab006a798facbc7917aa6c42e47e9ed7))
* 新增 agent_blog 项目基础文件，包括 Python 版本、项目描述、依赖项和 README 文档 ([bf3c6f9](https://github.com/bosens-China/yliu-blog-engine/commit/bf3c6f96a25f48345f3a25ec3819e7ffab1a21cc))


### Bug Fixes

* 修正分类页面的分页链接，确保使用正确的 ID 生成链接 ([cb12c3a](https://github.com/bosens-China/yliu-blog-engine/commit/cb12c3aa0ee8c5bafaa43090b27ad03b63bc9477))

## [1.8.1](https://github.com/bosens-China/yliu-blog-engine/compare/root-v1.8.0...root-v1.8.1) (2025-07-29)


### Bug Fixes

* 调整文章页面和代码块组件的样式，修复内容区域的内边距问题 ([65c15f6](https://github.com/bosens-China/yliu-blog-engine/commit/65c15f617a5e2c783d460ac2b87e501e5c041b7d))

## [1.8.0](https://github.com/bosens-China/yliu-blog-engine/compare/root-v1.7.1...root-v1.8.0) (2025-07-26)


### Features

* 更新 Tailwind 配置以支持新的颜色和边框半径，添加滚动条样式，重构文章和专栏页面以使用 ID 进行链接，优化搜索模态和 Markdown 内容组件，增强深色模式支持 ([8e85aa6](https://github.com/bosens-China/yliu-blog-engine/commit/8e85aa636708b2a063d378c2f6ca4ae654fe3e6e))
* 添加 GitHub 链接到移动菜单和头部组件，优化样式，更新全局样式以支持移动菜单背景，简化深色模式检测逻辑 ([e8e32f1](https://github.com/bosens-China/yliu-blog-engine/commit/e8e32f12175fd6ac64f7aedd862b210025f4478e))

## [1.7.1](https://github.com/bosens-China/yliu-blog-engine/compare/root-v1.7.0...root-v1.7.1) (2025-07-26)


### Bug Fixes

* 对链接进行编码以确保正确处理特殊字符，更新样式文件路径以支持基础路径配置 ([197ad5e](https://github.com/bosens-China/yliu-blog-engine/commit/197ad5e0a2500ff2e82cae50e2f790486b666da3))

## [1.7.0](https://github.com/bosens-China/yliu-blog-engine/compare/root-v1.6.5...root-v1.7.0) (2025-07-26)


### Features

* 更新依赖，添加新的代码块组件和目录功能，优化文档样式 ([93f91ee](https://github.com/bosens-China/yliu-blog-engine/commit/93f91eeac84a6a10cae678ff1b0143838d470581))
* 重构目录组件，提取共享子组件并添加浮动菜单支持，优化深色模式样式 ([ff3cb59](https://github.com/bosens-China/yliu-blog-engine/commit/ff3cb598cf815589f2f13cb1c8a18d98c3fb0800))

## [1.6.5](https://github.com/bosens-China/yliu-blog-engine/compare/root-v1.6.4...root-v1.6.5) (2025-07-18)


### Bug Fixes

* 更新深色模式背景颜色为 HSL 格式，以提高可读性 ([24a7b4f](https://github.com/bosens-China/yliu-blog-engine/commit/24a7b4f151e4be69e61723bac3ce8c5ad39753b9))

## [1.6.4](https://github.com/bosens-China/yliu-blog-engine/compare/root-v1.6.3...root-v1.6.4) (2025-07-18)


### Bug Fixes

* 添加 .gitattributes 文件并移除 AI_ENABLE_PROCESSING 输入，更新文档格式 ([0a18fe3](https://github.com/bosens-China/yliu-blog-engine/commit/0a18fe36db4b68a84267384b16bcaa793ff88758))

## [1.6.3](https://github.com/bosens-China/yliu-blog-engine/compare/root-v1.6.2...root-v1.6.3) (2025-07-18)


### Bug Fixes

* 修复专栏本地算法 ([ff0281a](https://github.com/bosens-China/yliu-blog-engine/commit/ff0281a46a4042a993dc69c5fc5946523a80bd76))

## [1.6.2](https://github.com/bosens-China/yliu-blog-engine/compare/root-v1.6.1...root-v1.6.2) (2025-07-18)


### Bug Fixes

* 更新样式以支持深色模式下的边框颜色，并优化列处理逻辑以移除标题末尾的分隔符 ([2a9d563](https://github.com/bosens-China/yliu-blog-engine/commit/2a9d563cd64d08c3f2ffd7804af89e23e2be2c56))

## [1.6.1](https://github.com/bosens-China/yliu-blog-engine/compare/root-v1.6.0...root-v1.6.1) (2025-07-18)


### Bug Fixes

* 更新环境配置，优化字段处理逻辑，添加预处理以支持空值转换 ([493e492](https://github.com/bosens-China/yliu-blog-engine/commit/493e49299f32a171947b71d1f6dfb08eecc61b8b))

## [1.6.0](https://github.com/bosens-China/yliu-blog-engine/compare/root-v1.5.18...root-v1.6.0) (2025-07-18)


### Features

* 增加 GitHub Actions 验证步骤以优化发布流程 ([bcd61a2](https://github.com/bosens-China/yliu-blog-engine/commit/bcd61a2ff25f67ae2f7804adc2b96bd7a490fe8b))
* 完成博客编写 ([c662b33](https://github.com/bosens-China/yliu-blog-engine/commit/c662b330ad488dda1b52cb179212faad5a48d3de))
* 更新 pnpm 版本并添加类型检查数据获取步骤 ([0f94834](https://github.com/bosens-China/yliu-blog-engine/commit/0f94834eb7e70c472c38d348ad579cabd4122c09))
* 更新博客引擎和配置 ([bd1e6fe](https://github.com/bosens-China/yliu-blog-engine/commit/bd1e6febfdd91c395cb8373ecc9c87d0e7309fc8))
* 添加全部文章标签和修复GitHub Action构建问题 ([a21d77b](https://github.com/bosens-China/yliu-blog-engine/commit/a21d77be2fc96c86b1f1a0d1569ace0b148c3f5b))
* 添加自定义 Header 菜单配置功能 ([95acdac](https://github.com/bosens-China/yliu-blog-engine/commit/95acdaca05e4eb510767aa290a19f0fb1b72dca1))
* 重构布局组件和新增页面 ([cd89980](https://github.com/bosens-China/yliu-blog-engine/commit/cd89980123c826bed856a7140787cf6dabca565d))


### Bug Fixes

* 为 web build 步骤导出环境变量并更新 .env 文件路径 ([a91b4f0](https://github.com/bosens-China/yliu-blog-engine/commit/a91b4f094c73fda346c05012b08543d0ade8988f))
* 优化 action.yml 中的步骤顺序 ([292b46a](https://github.com/bosens-China/yliu-blog-engine/commit/292b46a6aef497e0477826d167b6eafc072995b2))
* 优化 basePath 处理逻辑，简化代码并确保在图像处理时正确使用环境变量 ([e17b59c](https://github.com/bosens-China/yliu-blog-engine/commit/e17b59c3c54492e063a29c6c2c40324e76dc3922))
* 优化env.ts文件中的环境变量配置，增强URL验证和描述信息 ([238eb08](https://github.com/bosens-China/yliu-blog-engine/commit/238eb088ebb9a3d329c18f7ef02f02062e391220))
* 优化环境变量生成脚本，修正字符串处理和默认值设置 ([ee4b66d](https://github.com/bosens-China/yliu-blog-engine/commit/ee4b66d3f372c44b628b9b0b0c052d61f7c225de))
* 优化环境变量生成脚本，修正字符串引号和格式问题 ([585eadd](https://github.com/bosens-China/yliu-blog-engine/commit/585eadd996ed2d1729c3ee1516126dafa72b8d0f))
* 修复action.yml 流程 ([229a4fe](https://github.com/bosens-China/yliu-blog-engine/commit/229a4fe17c21b1c593dc12861492dcf2525388a2))
* 修复action.yml中缓存依赖路径的引号问题 ([091b2f2](https://github.com/bosens-China/yliu-blog-engine/commit/091b2f2ecc93d50884bc02533b7c75461f7b7d24))
* 修复docs ci报错的问题 ([096f57e](https://github.com/bosens-China/yliu-blog-engine/commit/096f57e872ade18fdd9519c7ceb9060a551cabd6))
* 修复github ci的错误 ([ea0f48c](https://github.com/bosens-China/yliu-blog-engine/commit/ea0f48cbb369eeeae8d3ff311a4660c62f630d6d))
* 修复图片防盗链没有正确处理问题 ([61544cb](https://github.com/bosens-China/yliu-blog-engine/commit/61544cbf777267a99da52915934c4c28443da6f8))
* 修复推导参数错误 ([4070329](https://github.com/bosens-China/yliu-blog-engine/commit/4070329d4c89c5af8c1c4550f96ed166e96fe9b8))
* 修改名称导致ci构建失败 ([28240fb](https://github.com/bosens-China/yliu-blog-engine/commit/28240fb99d7d1e94455ed4d16b2e6f3f1002b3d2))
* 对nextjs的generateStaticParams错误修复 ([afce8f8](https://github.com/bosens-China/yliu-blog-engine/commit/afce8f8a9c3de685698fa6c37ab5f9754be8a7ed))
* 对缓存依赖路径使用健壮的glob模式 ([ccc3306](https://github.com/bosens-China/yliu-blog-engine/commit/ccc330655cac5433411daee46849005e8447cae2))
* 更新 action.yml 和 README.md 配置 ([7636d27](https://github.com/bosens-China/yliu-blog-engine/commit/7636d27795583bb92ce7bd48afd6d6b2781058ef))
* 更新 action.yml 和 README.md 配置 ([bdfa855](https://github.com/bosens-China/yliu-blog-engine/commit/bdfa8558351c3b184920e7fc5cece467ed43993a))
* 更新 action.yml 和文档，调整输入参数描述及默认值，移除不必要的参数 ([93c4360](https://github.com/bosens-China/yliu-blog-engine/commit/93c4360adf93b42bc146c690a8c73de07e05912d))
* 更新 GitHub Actions 工作流以修复条件判断 ([fcc1cdd](https://github.com/bosens-China/yliu-blog-engine/commit/fcc1cdd194debe608b62d9fdbf2c22a0e53ca3de))
* 更新环境变量文件路径，修正.env文件生成位置 ([134ccae](https://github.com/bosens-China/yliu-blog-engine/commit/134ccaebc39957db8647bfcadae65520c88a828c))
* 移除冲突的assetPrefix覆盖 ([2c201c0](https://github.com/bosens-China/yliu-blog-engine/commit/2c201c0c484af81c4dc8dad12bfb3ee0e17b85e4))

## [1.5.18](https://github.com/bosens-China/yliu-blog-engine/compare/v1.5.17...v1.5.18) (2025-07-18)


### Bug Fixes

* 更新 action.yml 和文档，调整输入参数描述及默认值，移除不必要的参数 ([93c4360](https://github.com/bosens-China/yliu-blog-engine/commit/93c4360adf93b42bc146c690a8c73de07e05912d))

## [1.5.17](https://github.com/bosens-China/yliu-blog-engine/compare/v1.5.16...v1.5.17) (2025-07-18)


### Bug Fixes

* 优化 basePath 处理逻辑，简化代码并确保在图像处理时正确使用环境变量 ([e17b59c](https://github.com/bosens-China/yliu-blog-engine/commit/e17b59c3c54492e063a29c6c2c40324e76dc3922))

## [1.5.16](https://github.com/bosens-China/yliu-blog-engine/compare/v1.5.15...v1.5.16) (2025-07-18)


### Bug Fixes

* 为 web build 步骤导出环境变量并更新 .env 文件路径 ([a91b4f0](https://github.com/bosens-China/yliu-blog-engine/commit/a91b4f094c73fda346c05012b08543d0ade8988f))

## [1.5.15](https://github.com/bosens-China/yliu-blog-engine/compare/v1.5.14...v1.5.15) (2025-07-18)


### Bug Fixes

* 更新环境变量文件路径，修正.env文件生成位置 ([134ccae](https://github.com/bosens-China/yliu-blog-engine/commit/134ccaebc39957db8647bfcadae65520c88a828c))

## [1.5.14](https://github.com/bosens-China/yliu-blog-engine/compare/v1.5.13...v1.5.14) (2025-07-17)


### Bug Fixes

* 优化环境变量生成脚本，修正字符串处理和默认值设置 ([ee4b66d](https://github.com/bosens-China/yliu-blog-engine/commit/ee4b66d3f372c44b628b9b0b0c052d61f7c225de))

## [1.5.13](https://github.com/bosens-China/yliu-blog-engine/compare/v1.5.12...v1.5.13) (2025-07-17)


### Bug Fixes

* 优化环境变量生成脚本，修正字符串引号和格式问题 ([585eadd](https://github.com/bosens-China/yliu-blog-engine/commit/585eadd996ed2d1729c3ee1516126dafa72b8d0f))

## [1.5.12](https://github.com/bosens-China/yliu-blog-engine/compare/v1.5.11...v1.5.12) (2025-07-17)


### Bug Fixes

* 修复github ci的错误 ([ea0f48c](https://github.com/bosens-China/yliu-blog-engine/commit/ea0f48cbb369eeeae8d3ff311a4660c62f630d6d))

## [1.5.11](https://github.com/bosens-China/yliu-blog-engine/compare/v1.5.10...v1.5.11) (2025-07-17)


### Bug Fixes

* 修复推导参数错误 ([4070329](https://github.com/bosens-China/yliu-blog-engine/commit/4070329d4c89c5af8c1c4550f96ed166e96fe9b8))

## [1.5.10](https://github.com/bosens-China/yliu-blog-engine/compare/v1.5.9...v1.5.10) (2025-07-17)


### Bug Fixes

* 移除冲突的assetPrefix覆盖 ([2c201c0](https://github.com/bosens-China/yliu-blog-engine/commit/2c201c0c484af81c4dc8dad12bfb3ee0e17b85e4))

## [1.5.9](https://github.com/bosens-China/yliu-blog-engine/compare/v1.5.8...v1.5.9) (2025-07-17)


### Bug Fixes

* 修改名称导致ci构建失败 ([28240fb](https://github.com/bosens-China/yliu-blog-engine/commit/28240fb99d7d1e94455ed4d16b2e6f3f1002b3d2))

## [1.5.8](https://github.com/bosens-China/yliu-blog-engine/compare/v1.5.7...v1.5.8) (2025-07-17)


### Bug Fixes

* 优化env.ts文件中的环境变量配置，增强URL验证和描述信息 ([238eb08](https://github.com/bosens-China/yliu-blog-engine/commit/238eb088ebb9a3d329c18f7ef02f02062e391220))

## [1.5.7](https://github.com/bosens-China/yliu-blog-engine/compare/v1.5.6...v1.5.7) (2025-07-17)


### Bug Fixes

* 修复action.yml中缓存依赖路径的引号问题 ([091b2f2](https://github.com/bosens-China/yliu-blog-engine/commit/091b2f2ecc93d50884bc02533b7c75461f7b7d24))

## [1.5.6](https://github.com/bosens-China/yliu-blog-engine/compare/v1.5.5...v1.5.6) (2025-07-17)


### Bug Fixes

* 对缓存依赖路径使用健壮的glob模式 ([ccc3306](https://github.com/bosens-China/yliu-blog-engine/commit/ccc330655cac5433411daee46849005e8447cae2))

## [1.5.5](https://github.com/bosens-China/yliu-blog-engine/compare/v1.5.4...v1.5.5) (2025-07-17)


### Bug Fixes

* 修复action.yml 流程 ([229a4fe](https://github.com/bosens-China/yliu-blog-engine/commit/229a4fe17c21b1c593dc12861492dcf2525388a2))

## [1.5.4](https://github.com/bosens-China/yliu-blog-engine/compare/v1.5.3...v1.5.4) (2025-07-17)


### Bug Fixes

* 修复图片防盗链没有正确处理问题 ([61544cb](https://github.com/bosens-China/yliu-blog-engine/commit/61544cbf777267a99da52915934c4c28443da6f8))
* 对nextjs的generateStaticParams错误修复 ([afce8f8](https://github.com/bosens-China/yliu-blog-engine/commit/afce8f8a9c3de685698fa6c37ab5f9754be8a7ed))

## [1.5.3](https://github.com/bosens-China/yliu-blog-engine/compare/v1.5.2...v1.5.3) (2025-07-15)


### Bug Fixes

* 修复docs ci报错的问题 ([096f57e](https://github.com/bosens-China/yliu-blog-engine/commit/096f57e872ade18fdd9519c7ceb9060a551cabd6))
