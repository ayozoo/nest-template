import { Repository, DeepPartial, FindOptionsWhere } from 'typeorm';
import { BaseEntity } from './base.entity';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { IRepository } from '../interfaces/repository.interface';

/**
 * 通用基础仓库
 * - 封装常用 CRUD 操作
 * - T 必须继承自 BaseEntity (确保有 id 字段)
 */
export abstract class BaseRepository<
  T extends BaseEntity,
> implements IRepository<T> {
  protected constructor(protected readonly repository: Repository<T>) {}

  /**
   * 创建实体
   * - data: 实体数据
   * - 返回：保存后的实体
   */
  async create(data: Partial<T>): Promise<T> {
    const entity = this.repository.create(data as DeepPartial<T>);
    try {
      return await this.repository.save(entity);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 查询所有
   * - 返回：实体列表
   */
  async findAll(): Promise<T[]> {
    return await this.repository.find();
  }

  /**
   * 根据 ID 查询
   * - id: UUID
   * - 返回：实体或 null
   */
  async findOne(id: string): Promise<T | null> {
    return await this.repository.findOneBy({ id } as FindOptionsWhere<T>);
  }

  /**
   * 更新实体
   * - id: UUID
   * - data: 更新数据
   * - 返回：更新后的实体或 null (如果不存在)
   */
  async update(id: string, data: Partial<T>): Promise<T | null> {
    const entity = await this.findOne(id);
    if (!entity) {
      return null;
    }
    this.repository.merge(entity, data as DeepPartial<T>);
    try {
      return await this.repository.save(entity);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 删除实体
   * - id: UUID
   * - 返回：删除的实体或 null (如果不存在)
   */
  async remove(id: string): Promise<T | null> {
    const entity = await this.findOne(id);
    if (!entity) {
      return null;
    }
    return await this.repository.remove(entity);
  }

  /**
   * 统一错误处理
   */
  protected handleError(error: unknown): never {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === '23505'
    ) {
      throw new ConflictException(
        'Entity with this unique field already exists',
      );
    }
    throw new InternalServerErrorException(error);
  }
}
