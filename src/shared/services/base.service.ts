import { NotFoundException } from '@nestjs/common';
import { BaseEntity } from '../database/base.entity';
import { IRepository } from '../interfaces/repository.interface';

/**
 * 通用基础服务
 * - 封装标准 CRUD 业务逻辑
 * - 处理通用的异常（如 NotFoundException）
 */
export abstract class BaseService<T extends BaseEntity> {
  protected constructor(
    protected readonly repository: IRepository<T>,
    protected readonly entityName: string = 'Entity',
  ) {}

  /**
   * 创建实体
   */
  async create(data: Partial<T>): Promise<T> {
    return await this.repository.create(data);
  }

  /**
   * 查询所有
   */
  async findAll(): Promise<T[]> {
    return await this.repository.findAll();
  }

  /**
   * 根据 ID 查询
   * - 不存在时抛出 NotFoundException
   */
  async findOne(id: string): Promise<T> {
    const entity = await this.repository.findOne(id);
    if (!entity) {
      throw new NotFoundException(`${this.entityName} with ID ${id} not found`);
    }
    return entity;
  }

  /**
   * 更新实体
   * - 不存在时抛出 NotFoundException
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    const entity = await this.repository.update(id, data);
    if (!entity) {
      throw new NotFoundException(`${this.entityName} with ID ${id} not found`);
    }
    return entity;
  }

  /**
   * 删除实体
   * - 不存在时抛出 NotFoundException
   */
  async remove(id: string): Promise<T> {
    const entity = await this.repository.remove(id);
    if (!entity) {
      throw new NotFoundException(`${this.entityName} with ID ${id} not found`);
    }
    return entity;
  }
}
