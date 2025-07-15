import chalk from 'chalk';

export function log(message: string) {
  console.log(chalk.cyan(`[信息] ${message}`));
}

export function warn(message: string) {
  console.warn(chalk.yellow(`[警告] ${message}`));
}

export function error(message: string, errorDetails?: unknown): never {
  console.error(chalk.red.bold(`\n❌ [错误] ${message}`));
  if (errorDetails) {
    const err = errorDetails as Error;
    console.error(chalk.red(err.stack || err.message));
  }
  console.error(chalk.red.bold('\n构建进程已终止。'));
  process.exit(1);
}
