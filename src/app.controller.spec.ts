/**
 * 控制器单元测试
 * - 使用 TestingModule 构建最小依赖上下文
 * - 注入 AppService 供控制器使用
 *
 * 参数级说明：
 * - Test.createTestingModule({ controllers, providers })
 *   - controllers: 要测试的控制器列表
 *   - providers: 控制器依赖的服务/提供者
 * - app.get(AppController): 从测试容器中获取实例
 * - expect(...).toBe(...): 断言返回值与预期一致
 */
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
