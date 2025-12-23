import { startServer } from './bootstrap/start-server';
/**
 * 应用入口（仅负责启动）
 * - 将所有初始化与配置逻辑委托给 bootstrap 模块
 * - 保持入口文件最小化与单一职责
 *
 * 导出：
 * - 无（直接触发启动）
 */
void startServer();
