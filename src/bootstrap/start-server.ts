import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../app.module';
import { setupApp } from './setup-app';
import { AppLogger } from '@shared/logging/logging.service';

/**
 * 启动 HTTP 服务
 * - 创建应用实例
 * - 调用 setupApp 完成应用级初始化
 * - 读取端口并启动监听
 * - 输出运行地址与文档地址
 *
 * 环境变量：
 * - PORT: number —— 服务监听端口，默认 3000
 */
export async function startServer() {
  const app = await NestFactory.create(AppModule);
  await setupApp(app);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);
  const logger = app.get(AppLogger);
  logger.log(`Application is running on: http://localhost:${port}/api/v1`);
  logger.log(
    `Scalar API Reference is running on: http://localhost:${port}/api/reference`,
  );
  logger.log(
    `Redoc documentation is running on: http://localhost:${port}/api/redoc`,
  );
}
