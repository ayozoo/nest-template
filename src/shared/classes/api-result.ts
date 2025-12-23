import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 统一 API 响应结果类
 * 用于在 Service 或 Controller 中动态返回自定义状态码和消息
 */
export class ApiResult<T> {
  @ApiProperty({ description: '业务状态码', example: 200 })
  public readonly code: number;

  @ApiProperty({ description: '响应消息', example: 'Success' })
  public readonly message: string;

  @ApiProperty({ description: '响应数据', required: false })
  public readonly data?: T;

  constructor(code: number, message: string, data?: T) {
    this.code = code;
    this.message = message;
    this.data = data;
  }

  /**
   * 创建成功响应
   * @param data 数据
   * @param message 消息
   * @param code 状态码
   */
  static success<T>(
    data?: T,
    message = 'Success',
    code = HttpStatus.OK,
  ): ApiResult<T> {
    return new ApiResult(code, message, data);
  }

  /**
   * 创建错误/自定义响应
   * @param message 消息
   * @param code 状态码
   * @param data 数据
   */
  static custom<T>(message: string, code: number, data?: T): ApiResult<T> {
    return new ApiResult(code, message, data);
  }
}
