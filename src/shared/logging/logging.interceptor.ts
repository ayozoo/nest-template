/**
 * 日志拦截器
 * - 读取由 @LogAction 装饰器设置的元数据，按需打印请求进入/退出日志
 * - 支持输出路由方法、路径、状态码、耗时与可选消息
 *
 * 参数说明（intercept）：
 * - context: 当前执行上下文，包含控制器类与处理器方法等信息
 * - next: 调用链句柄，调用 next.handle() 可继续后续处理并获得响应 Observable
 *
 * 参数说明（内部 emit）：
 * - lvl: 日志等级（'log' | 'error' | 'warn' | 'debug' | 'verbose'）
 * - message: 日志内容文本
 */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AppLogger } from './logging.service';
import { LOG_ACTION_METADATA_KEY, LogActionOptions } from './log.decorator';
import { LogLevel } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: AppLogger,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    // context.getHandler(): 获取当前被调用的路由处理方法（函数）
    const handler = context.getHandler();
    // context.getClass(): 获取当前被调用的控制器类
    const cls = context.getClass();

    // reflector.get: 获取装饰器元数据
    // 优先读取方法上的 @LogAction，其次读取类上的 @LogAction
    const options =
      this.reflector.get<LogActionOptions>(LOG_ACTION_METADATA_KEY, handler) ??
      this.reflector.get<LogActionOptions>(LOG_ACTION_METADATA_KEY, cls);

    // 若未标记 @LogAction，则直接透传，不记录日志
    if (!options) {
      return next.handle();
    }

    // context.switchToHttp(): 切换到 HTTP 上下文
    const http = context.switchToHttp();
    // http.getRequest(): 获取原生请求对象
    const req = http.getRequest<{ method: string; url: string }>();
    const method = req?.method ?? 'N/A';
    const url = req?.url ?? 'N/A';

    // 提取日志选项中的消息和等级
    const msg = options.message ?? 'Action';
    const level: LogLevel = options.level ?? 'log';

    // 辅助函数：统一输出日志
    const emit = (lvl: LogLevel, message: string) => {
      switch (lvl) {
        case 'debug':
          this.logger.debug(message, cls.name);
          break;
        case 'verbose':
          this.logger.verbose(message, cls.name);
          break;
        case 'warn':
          this.logger.warn(message, cls.name);
          break;
        case 'error':
          this.logger.error(message, undefined, cls.name);
          break;
        default:
          this.logger.log(message, cls.name);
      }
    };

    // 记录【进入】日志 (Request ID 已由 AppLogger 自动处理)
    emit(level, `[ENTER] ${method} ${url} - ${msg}`);

    // next.handle(): 调用后续处理链（守卫、其他拦截器、控制器方法）
    // .pipe(tap(...)): 使用 RxJS tap 操作符在响应流处理完成后执行副作用（记录退出日志）
    return next.handle().pipe(
      tap({
        next: () => {
          // http.getResponse(): 获取原生响应对象
          const res = http.getResponse<{ statusCode: number }>();
          const status = res?.statusCode ?? 'N/A';
          const cost = Date.now() - now;
          // 记录【退出】日志（成功）
          emit(
            level,
            `[EXIT] ${method} ${url} ${status} - ${msg} (+${cost}ms)`,
          );
        },
        error: (err) => {
          const cost = Date.now() - now;
          // 记录【退出】日志（异常）
          this.logger.error(
            `[EXIT] ${method} ${url} - ${msg} (+${cost}ms) - Error: ${err instanceof Error ? err.message : String(err)}`,
            err instanceof Error ? err.stack : String(err),
            cls.name,
          );
        },
      }),
    );
  }
}
