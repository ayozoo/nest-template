/**
 * 通用仓库接口
 * - 定义数据访问层的标准契约
 * - 纯 TypeScript 定义，不依赖具体 ORM
 */
export interface IRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findAll(): Promise<T[]>;
  findOne(id: string): Promise<T | null>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  remove(id: string): Promise<T | null>;
}
