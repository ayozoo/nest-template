/**
 * 端到端（E2E）测试
 * - 通过启动完整的 Nest 应用来测试路由与中间件/拦截器/过滤器链
 *
 * 参数级说明：
 * - Test.createTestingModule({ imports: [AppModule] }): 加载整个应用模块
 * - moduleFixture.createNestApplication(): 创建 Nest 应用实例
 * - app.init(): 初始化应用（注册拦截器、过滤器、管道等）
 * - request(app.getHttpServer()): 使用 supertest 发起 HTTP 请求
 * - .get('/'): 访问根路由
 * - .expect(200).expect('Hello World!'): 断言状态码与响应体
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
