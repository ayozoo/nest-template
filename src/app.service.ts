/**
 * 应用根服务
 * - 提供简单业务逻辑：返回欢迎字符串
 *
 * 学习要点：
 * - 服务承载业务逻辑，控制器只负责路由
 * - 服务默认是单例作用域
 */
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'nest template is running! ✨';
  }
}
