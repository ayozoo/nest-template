/**
 * 方法/类级日志装饰器
 * - 通过设置元数据，指示拦截器在进入/退出时输出日志
 * - 可用于控制器或其方法上
 *
 * 使用示例：
 *   @LogAction('Create user') // 仅指定消息
 *   @LogAction({ message: 'Create user', level: 'debug' }) // 指定消息与日志等级
 *   @Post() create(...) { ... }
 *
 * 参数说明：
 * - options.message: 自定义消息前缀（可选）
 * - options.level: 日志等级（'log' | 'error' | 'warn' | 'debug' | 'verbose'）
 */
import { LogLevel, SetMetadata } from '@nestjs/common';

export const LOG_ACTION_METADATA_KEY = 'log_action';

export interface LogActionOptions {
  message?: string;
  level?: LogLevel;
}

export function LogAction(options?: LogActionOptions | string) {
  const normalized: LogActionOptions =
    typeof options === 'string' ? { message: options } : (options ?? {});
  return SetMetadata(LOG_ACTION_METADATA_KEY, normalized);
}
