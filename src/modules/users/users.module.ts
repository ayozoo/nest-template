/**
 * 用户模块
 * - 组合控制器与服务
 * - 通过 TypeOrmModule.forFeature 注册实体仓库（注入 Repository<User>）
 *
 * 学习要点：
 * - forFeature 只在当前模块范围提供仓库
 * - 其他模块若需使用，可通过导出或在各自模块中再次注册
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
