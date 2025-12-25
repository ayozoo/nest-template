import {
  INestApplication,
  ValidationPipe,
  LogLevel,
  ClassSerializerInterceptor,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '@shared/logging/logging.service';
import { TransformInterceptor } from '@shared/interceptors/transform.interceptor';
import { HttpExceptionFilter } from '@shared/filters/http-exception.filter';
import { LoggingInterceptor } from '@shared/logging/logging.interceptor';
import { Reflector } from '@nestjs/core';
import { setupDocumentation } from './setup-documentation';

/**
 * 设置应用级基础设施
 * - 日志器：替换默认日志，读取 LOG_LEVELS 白名单
 * - 校验管道：请求体验证与类型转换（ValidationPipe）
 * - 拦截器：日志（LoggingInterceptor）、统一响应（TransformInterceptor）
 * - 异常过滤器：统一错误结构（HttpExceptionFilter）
 * - API 文档：Scalar API Reference
 *
 * 参数：
 * - app: INestApplication —— Nest 应用实例
 */
export async function setupApp(app: INestApplication) {
  const configService = app.get(ConfigService);
  const appLogger = app.get(AppLogger);

  app.useLogger(appLogger);

  const levelStr = configService.get<string>('LOG_LEVELS');
  if (levelStr) {
    const all: LogLevel[] = ['log', 'error', 'warn', 'debug', 'verbose'];
    const levels = levelStr
      .split(',')
      .map((s) => s.trim())
      .filter((s): s is LogLevel => (all as string[]).includes(s));
    if (levels.length) {
      appLogger.setLogLevels(levels);
    }
  }

  // 全局前缀与版本
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  // 优雅停机
  app.enableShutdownHooks();
  // CORS
  const corsOrigins = configService.get<string>('CORS_ORIGIN');
  const originList = corsOrigins
    ? corsOrigins
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : true;
  app.enableCors({
    origin: originList,
    credentials: true,
  });

  // 全局校验与类型转换
  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: 如果设置为 true，验证器将剥离任何不使用任何装饰器的属性的验证（即白名单机制，去掉多余字段）
      whitelist: true,
      // forbidNonWhitelisted: 如果设置为 true，当出现非白名单属性时，验证器将抛出异常（配合 whitelist 使用，严格控制输入）
      forbidNonWhitelisted: true,
      // transform: 如果设置为 true，验证器将根据 DTO 类的类型定义自动转换载荷（例如将字符串数字转为 number）
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  // 顺序：先日志再统一响应
  app.useGlobalInterceptors(
    // LoggingInterceptor: 自定义日志拦截器，用于记录请求处理时间及根据装饰器记录操作日志
    // 依赖注入: 需要手动传入 AppLogger 和 Reflector（因为是在 main 中手动 new 的，不在 DI 容器自动管理范围内）
    new LoggingInterceptor(appLogger, app.get(Reflector)),
    new ClassSerializerInterceptor(app.get(Reflector)),
    // TransformInterceptor: 统一响应拦截器，将所有成功响应包装为统一结构（含状态码、消息、数据等）
    new TransformInterceptor(app.get(Reflector)),
  );
  // 统一错误结构
  // HttpExceptionFilter: 全局异常过滤器，将所有 HttpException 格式化为标准错误 JSON
  app.useGlobalFilters(new HttpExceptionFilter());

  // 配置 API 文档 (Scalar)
  await setupDocumentation(app);
}
