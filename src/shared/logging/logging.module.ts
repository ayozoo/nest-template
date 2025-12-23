/**
 * 全局日志模块
 * - 提供自定义日志服务 AppLogger
 * - 使用 @Global() 使其在整个应用中可用（无需重复导入）
 *
 * 学习要点：
 * - 全局模块适合提供横切关注点（日志、缓存、配置等）
 * - exports 将提供者导出，供其他模块注入使用
 */
import { Global, Module } from '@nestjs/common';
import { AppLogger } from './logging.service';

@Global()
@Module({
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LoggingModule {}
