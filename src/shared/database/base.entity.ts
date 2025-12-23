/**
 * 通用基础实体
 * - 为所有业务实体提供统一字段：id/createdAt/updatedAt
 *
 * 参数说明：
 * - @PrimaryGeneratedColumn('uuid'): 使用 UUID 主键
 * - @CreateDateColumn({ type, default }): 创建时间戳，默认 CURRENT_TIMESTAMP
 * - @UpdateDateColumn({ type, default, onUpdate }): 更新时间戳，更新时自动刷新
 * - 抽象类：供业务实体继承，避免重复字段定义
 */
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  // uuid: 数据库生成 UUID 作为主键
  id!: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  // type: 时间戳类型
  // default: 默认为当前时间
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  // onUpdate: 更新时自动刷新为当前时间
  updatedAt!: Date;
}
