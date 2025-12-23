/**
 * 用户实体
 * - 描述 users 表的结构与约束
 *
 * 学习要点：
 * - @Entity('users') 指定表名
 * - @Column 描述列属性（长度、唯一、默认值、是否在查询中选择）
 * - 继承 BaseEntity 复用主键与时间戳
 */
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@shared/database/base.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ length: 50 })
  // length: 最大字符长度为 50
  name!: string;

  @Column({ unique: true })
  // unique: 在数据库层保证 email 的唯一性
  email!: string;

  // 默认查询不返回密码，避免泄露
  @Column({ select: false })
  password!: string;

  @Column({ default: 'user', length: 20 })
  // default: 默认值为 'user'
  // length: 最大字符长度为 20
  role!: string;
}
