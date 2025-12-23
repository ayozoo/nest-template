/**
 * 创建用户的请求数据传输对象（DTO）
 * - 描述并校验请求体结构
 * - 结合 class-validator 与 Swagger 装饰器
 *
 * 学习要点：
 * - DTO 负责声明与校验输入数据类型
 * - @ApiProperty 用于生成文档示例与描述
 * - 强密码校验确保安全性
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  // 用户姓名：2-50 个字符
  @ApiProperty({
    description: 'The name of the user',
    minLength: 2,
    maxLength: 50,
    example: 'John Doe',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name!: string;

  // 用户邮箱：唯一性在数据库层通过 @Column({ unique: true }) 保证
  @ApiProperty({
    description: 'The email of the user',
    example: 'john@example.com',
  })
  @IsEmail()
  email!: string;

  // 用户密码：使用强密码策略（含大小写字母、数字、符号）
  @ApiProperty({
    description: 'The password of the user',
    minLength: 8,
    example: 'StrongP@ssw0rd!',
  })
  // IsStrongPassword 默认规则：
  // - minLength: 8
  // - minLowercase: 1
  // - minUppercase: 1
  // - minNumbers: 1
  // - minSymbols: 1
  @IsStrongPassword()
  password!: string;

  // 用户角色：可选，默认值在实体层定义为 'user'
  @ApiPropertyOptional({
    description: 'The role of the user',
    maxLength: 20,
    example: 'user',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  role?: string;
}
