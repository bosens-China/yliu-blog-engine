import type { BuildContext } from './types';

/**
 * 插件的接口定义。
 * 每个钩子都是可选的，插件可以只实现它关心的生命周期。
 */
export interface Plugin {
  /**
   * 插件的唯一名称，用于日志和调试。
   */
  name: string;

  /**
   * 资源获取钩子。
   * 职责：从外部（API, 文件系统等）获取原始数据。
   * 操作：将获取的数据写入 `context.dataSource`。
   */
  resource?: (context: BuildContext) => Promise<void>;

  /**
   * 数据转换钩子。
   * 职责：处理、转换、增强数据。
   * 操作：从 `context.dataSource` 或 `context.data` 读取，将结果写入 `context.data`。
   */
  transform?: (context: BuildContext) => Promise<void>;

  /**
   * 产物输出钩子。
   * 职责：将最终处理好的数据写入文件。
   * 操作：从 `context.data` 读取并执行文件写入。
   */
  output?: (context: BuildContext) => Promise<void>;
}
