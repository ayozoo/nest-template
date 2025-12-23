/**
 * 自定义应用日志器（AppLogger）
 * - 实现 Nest 的 LoggerService 接口：log/error/warn/debug/verbose
 * - 通过 setLogLevels(levels) 动态设置启用的日志等级白名单
 * - 格式化输出包含：时间戳 + 可选上下文 + 消息文本
 *
 * 参数说明：
 * - setLogLevels(levels: LogLevel[]): 配置日志等级白名单
 * - log(message, context?): 普通日志
 * - error(message, trace?, context?): 错误日志（附可选堆栈）
 * - warn(message, context?): 警告
 * - debug(message, context?): 调试
 * - verbose(message, context?): 详细
 * - print(level, message, context?, trace?): 统一格式化输出
 */
import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class AppLogger implements LoggerService {
  private logLevels: LogLevel[] = ['log', 'error', 'warn', 'debug', 'verbose'];

  constructor(private readonly cls: ClsService) {}

  setLogLevels(levels: LogLevel[]): void {
    this.logLevels = levels;
  }

  log(message: any, context?: string): void {
    this.print('log', message, context);
  }

  error(message: any, trace?: string, context?: string): void {
    this.print('error', message, context, trace);
  }

  warn(message: any, context?: string): void {
    this.print('warn', message, context);
  }

  debug(message: any, context?: string): void {
    this.print('debug', message, context);
  }

  verbose(message: any, context?: string): void {
    this.print('verbose', message, context);
  }

  private print(
    level: LogLevel,
    message: any,
    context?: string,
    trace?: string,
  ): void {
    if (!this.logLevels.includes(level)) {
      return;
    }

    // 从 CLS 获取 requestId，如果不存在（如系统启动时）则为 system
    const rid = this.cls.getId() ?? 'system';
    // 构建结构化日志对象
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      rid,
      context,
      message: String(message),
      ...(trace && { trace }),
    };

    // 统一输出 JSON 字符串
    const jsonString = JSON.stringify(logEntry);

    switch (level) {
      case 'error':
        console.error(jsonString);
        break;
      case 'warn':
        console.warn(jsonString);
        break;
      case 'debug':
        console.debug(jsonString);
        break;
      case 'verbose':
        console.info(jsonString);
        break;
      default:
        console.log(jsonString);
    }
  }
}
