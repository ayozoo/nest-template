/**
 * 统一成功响应拦截器
 * - 在控制器返回响应前拦截并包装为统一结构：{ data: ... }
 *
 * 参数说明：
 * - intercept(context: ExecutionContext, next: CallHandler)
 *   - context: 当前执行上下文（控制器/方法信息）
 *   - next: 调用链句柄，返回响应 Observable
 * - Response<T>: 响应包装类型（data 字段承载原始数据）
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  RESPONSE_MESSAGE_METADATA,
  RESPONSE_CODE_METADATA,
} from '../decorators/response-message.decorator';
import { ApiResult } from '../classes/api-result';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data: any) => {
        const request = context.switchToHttp().getRequest<{ url: string }>();
        const response = context
          .switchToHttp()
          .getResponse<{ statusCode: number }>();

        // 如果直接返回的是 ApiResult 实例，则直接使用其中的配置
        if (data instanceof ApiResult) {
          return {
            statusCode: data.code,
            message: data.message,
            data: data.data as T,
            timestamp: new Date().toISOString(),
            path: request.url,
          };
        }

        // 获取装饰器配置的元数据
        const handler = context.getHandler();
        const message =
          this.reflector.get<string>(RESPONSE_MESSAGE_METADATA, handler) ||
          'Success';
        const code =
          this.reflector.get<number>(RESPONSE_CODE_METADATA, handler) ||
          response.statusCode ||
          HttpStatus.OK;

        return {
          statusCode: code,
          message,
          data: data as T,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }
}
