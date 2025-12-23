/**
 * 应用根控制器
 * - 暴露 GET / 路由
 * - 调用 AppService 返回简单字符串
 *
 * 学习要点：
 * - 控制器负责路由与输入输出，不承载复杂业务
 * - 具体业务逻辑放在 Service 中
 */
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  // 通过依赖注入获取服务实例
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    // 委托给服务层处理逻辑
    return this.appService.getHello();
  }

  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
