/**
 * 更新用户的请求 DTO
 * - 使用 PartialType(CreateUserDto) 将所有字段变为可选
 *
 * 学习要点：
 * - 部分更新场景常用 PartialType 复用创建 DTO 的校验规则
 */
import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
