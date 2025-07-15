import type { Plugin } from '@/core/plugin';
import type { BuildContext } from '@/core/types';
import { log, error } from '@/utils/logger';

export function createRunner(context: BuildContext, plugins: Plugin[]) {
  async function executeHook(hookName: 'resource' | 'transform' | 'output') {
    log(`--- 开始执行 ${hookName.toUpperCase()} 阶段 ---`);
    for (const plugin of plugins) {
      // 从插件对象上获取钩子函数
      const hook = plugin[hookName];
      if (typeof hook === 'function') {
        try {
          log(`[${plugin.name}] 开始执行...`);

          // 使用 .call() 来调用钩子，
          // 第一个参数是函数执行时的 this 上下文（我们希望是插件本身），
          // 后续参数是传递给钩子函数的实际参数。
          await hook.call(plugin, context);

          log(`[${plugin.name}] 执行完毕。`);
        } catch (e: unknown) {
          error(`插件 [${plugin.name}] 在 [${hookName}] 阶段执行失败`, e);
        }
      }
    }
  }

  async function run() {
    log(`🚀 开始执行${context.config.isDev ? '开发' : '生产'}模式构建...`);
    await executeHook('resource');
    await executeHook('transform');
    await executeHook('output');
    log('✨ 所有阶段执行完毕，构建成功！');
  }

  return { run };
}
