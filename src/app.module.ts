/**
 * 应用根模块（AppModule）
 * - 汇总配置、日志、数据库与业务模块
 * - 通过 TypeOrmModule.forRootAsync 根据环境装配数据库连接
 *
 * 参数说明：
 * - ConfigModule.forRoot({ isGlobal: true })
 *   - isGlobal: 将配置服务注入为全局提供者，避免重复导入
 * - TypeOrmModule.forRootAsync({ imports, inject, useFactory })
 *   - imports: 需要的模块，用于注入 ConfigService
 *   - inject: 注入令牌列表（这里为 ConfigService）
 *   - useFactory: 工厂函数，返回 TypeORM 连接配置对象
 *     - 区分测试（SQLite 内存）与开发/生产（Postgres）
 *     - autoLoadEntities: 自动聚合所有实体，减少维护成本
 *     - synchronize: 仅在非生产环境自动建表，生产改用 migration
 *     - retryAttempts/retryDelay: 连接重试参数，提升健壮性
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { AppController } from './app.controller';
import { LoggingModule } from '@shared/logging/logging.module';
import { UsersModule } from '@modules/users/users.module';

@Module({
  imports: [
    // 使 .env 中的配置全局可用
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // 异步本地存储模块，用于追踪全链路 Request ID
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    // 配置数据库连接，测试环境使用内存 SQLite，开发/生产使用 Postgres
    TypeOrmModule.forRootAsync({
      // imports: 导入 ConfigModule 以便在 useFactory 中使用 ConfigService
      imports: [ConfigModule],
      // inject: 注入 ConfigService 实例
      inject: [ConfigService],
      // useFactory: 异步工厂函数，等待 ConfigService 就绪后动态生成配置
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV');
        const isTest = nodeEnv === 'test';
        if (isTest) {
          return {
            type: 'sqlite',
            // database: ':memory:' 使用内存数据库，测试完成即清空
            database: ':memory:',
            // dropSchema: true 每次启动都重建 schema，确保测试隔离
            dropSchema: true,
            // autoLoadEntities: true 自动加载所有模块中的 @Entity，无需手动注册 entities 数组
            autoLoadEntities: true,
            // synchronize: true 自动同步实体到表结构（仅测试/开发环境使用，生产环境禁止）
            synchronize: true,
            // logging: false 测试环境禁用 SQL 日志输出，保持控制台清洁
            logging: false,
          };
        }
        return {
          type: 'postgres',
          // host: 数据库主机地址（默认 localhost），从环境变量读取
          host: configService.get<string>('DB_HOST'),
          // port: 数据库端口（默认 5432），从字符串安全转换为 number
          port: parseInt(configService.get<string>('DB_PORT') ?? '5432', 10),
          // username: 连接数据库的用户名
          username: configService.get<string>('DB_USERNAME'),
          // password: 连接数据库的密码
          password: configService.get<string>('DB_PASSWORD'),
          // database: 使用的数据库名
          database: configService.get<string>('DB_DATABASE'),
          // autoLoadEntities: true 自动加载各模块注册的实体
          autoLoadEntities: true,
          // synchronize: 非生产环境自动同步表结构（生产环境建议使用 Migration）
          synchronize: nodeEnv !== 'production',
          // retryAttempts: 数据库连接失败时的重试次数
          retryAttempts: 5,
          // retryDelay: 重试间隔（毫秒）
          retryDelay: 3000,
          // logging: 非生产环境仅开启错误和警告日志，避免常规 SQL 刷屏
          // 可选值: boolean | "all" | ("query" | "schema" | "error" | "warn" | "info" | "log" | "migration")[]
          logging: nodeEnv !== 'production' ? ['error', 'warn'] : false,
        };
      },
    }),
    // 全局日志模块，提供 AppLogger
    LoggingModule,
    // 业务模块（用户模块）
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
