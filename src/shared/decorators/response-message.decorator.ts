import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE_METADATA = 'response:message';
export const RESPONSE_CODE_METADATA = 'response:code';

/**
 * 自定义响应消息装饰器
 * @param message 响应消息
 * @param statusCode 业务状态码 (可选)
 */
export const ResponseMessage = (message: string, statusCode?: number) => {
  return (
    target: object,
    key?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>,
  ) => {
    SetMetadata(RESPONSE_MESSAGE_METADATA, message)(
      target,
      key as string | symbol,
      descriptor as any,
    );
    if (statusCode !== undefined) {
      SetMetadata(RESPONSE_CODE_METADATA, statusCode)(
        target,
        key as string | symbol,
        descriptor as TypedPropertyDescriptor<unknown>,
      );
    }
  };
};
