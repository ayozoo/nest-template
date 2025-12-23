/**
 * 用户服务
 * - 承载用户相关业务逻辑与数据访问
 *
 * 学习要点：
 * - 使用 InjectRepository 注入 TypeORM 的仓库对象（Repository<User>）
 * - 仓库提供常见数据操作：create/save/find/findOne/merge/remove
 * - 服务层负责业务校验与组合处理（如不存在时抛出 NotFoundException）
 */
import { Injectable } from '@nestjs/common';
import { BaseService } from '../../shared/services/base.service';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(private readonly usersRepository: UsersRepository) {
    super(usersRepository, 'User');
  }
}
