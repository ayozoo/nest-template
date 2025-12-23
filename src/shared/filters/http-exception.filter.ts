/**
 * 全局异常过滤器
 * - 捕获控制器/服务抛出的异常，统一返回错误结构
 *
 * 参数说明：
 * - @Catch(): 不指定类型时捕获所有异常
 * - catch(exception: unknown, host: ArgumentsHost)
 *   - exception: 捕获到的异常实例或其他值
 *   - host: 执行上下文，可切换到 HTTP 以获取 Request/Response
 * - 返回结构：{ statusCode, timestamp, path, message }
 */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // ArgumentsHost 可切换到不同的上下文（http / rpc / ws）
    // 这里切换到 HTTP，以获取 Request / Response
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // status: 优先从 HttpException 获取状态码，否则为 500
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // message: 可能是字符串或对象，取自 HttpException.getResponse()
    const isProd = process.env.NODE_ENV === 'production';
    const raw =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    let message: string = 'Internal server error';
    if (typeof raw === 'string') {
      message = raw;
    } else if (raw && typeof raw === 'object') {
      const m = (raw as { message?: string | string[] }).message;
      if (Array.isArray(m)) {
        message = m.join(', ');
      } else if (typeof m === 'string') {
        message = m;
      } else if (!isProd) {
        // 非生产环境保留原始对象的字符串化信息以便调试
        message = JSON.stringify(raw);
      }
    }

    // 统一错误返回结构
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
