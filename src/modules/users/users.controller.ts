/**
 * 用户控制器
 * - 定义用户相关的 HTTP 路由
 * - 调用服务层执行业务逻辑
 *
 * 学习要点：
 * - 使用 Swagger 装饰器生成接口文档（标签、摘要、响应说明）
 * - 使用 ParseUUIDPipe 对路径参数进行格式校验
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LogAction } from '@shared/logging/log.decorator';
import { ResponseMessage } from '@shared/decorators/response-message.decorator';
import { ApiResult } from '@shared/classes/api-result';

@ApiTags('users')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  // 通过依赖注入获取服务实例
  constructor(private readonly usersService: UsersService) {}

  @Post()
  // @ApiOperation: 描述接口功能，用于生成 Swagger 文档摘要
  @ApiOperation({ summary: 'Create a new user' })
  // @ApiResponse: 描述接口响应，用于生成 Swagger 文档响应示例
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  // @LogAction: 自定义装饰器，用于记录操作日志
  // message: 日志消息前缀
  // level: 日志等级
  @LogAction({ message: 'Create user', level: 'log' })
  @ResponseMessage('User created successfully')
  /**
   * 创建用户
   * - Body(dto: CreateUserDto): 绑定并校验请求体（姓名/邮箱/强密码/角色）
   * - 返回持久化后的用户实体
   */
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @LogAction({ message: 'List users', level: 'debug' })
  /**
   * 查询所有用户
   * - 无入参
   * - 返回用户列表数组
   */
  async findAll() {
    const users = await this.usersService.findAll();
    return ApiResult.success(users, 'User list retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @LogAction({ message: 'Get user by id', level: 'debug' })
  /**
   * 根据 ID 查询用户
   * - Param('id', ParseUUIDPipe): 从路径读取 id 并校验为 UUID
   * - 返回用户实体（不存在抛 404）
   */
  findOne(
    // @Param('id'): 获取路径参数 :id
    // ParseUUIDPipe: 管道校验，确保 id 是有效的 UUID 格式，否则抛出 400 错误
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @LogAction({ message: 'Update user', level: 'log' })
  /**
   * 更新用户
   * - Param('id', ParseUUIDPipe): 路径参数，校验 UUID
   * - Body(dto: UpdateUserDto): 部分更新 DTO（字段可选）
   * - 返回更新后的用户实体
   */
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @LogAction({ message: 'Delete user', level: 'warn' })
  /**
   * 删除用户
   * - Param('id', ParseUUIDPipe): 路径参数，校验 UUID
   * - 返回删除结果（已删除实体）
   */
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
