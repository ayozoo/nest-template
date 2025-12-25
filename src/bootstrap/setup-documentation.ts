import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { ApiReferenceOptions } from '@scalar/nestjs-api-reference';
import { Request, Response } from 'express';

/**
 * 设置 API 文档
 * - 生成 OpenAPI 规范
 * - 挂载 Scalar API Reference (OpenAI 风格)
 * - 挂载 Redoc (专业风格)
 */
export async function setupDocumentation(app: INestApplication) {
  // 1. 构建 Swagger/OpenAPI 文档对象
  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('The API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // 2. 暴露 OpenAPI JSON 接口 (供 Redoc 或其他工具使用)
  app.getHttpAdapter().get('/api/docs-json', (req: Request, res: Response) => {
    res.json(document);
  });

  // 3. 挂载 Redoc
  const redocOptions = {
    title: 'NestJS API Docs',
    specUrl: '/api/docs-json',
  };
  const redocHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${redocOptions.title}</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
        <style>
          body {
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        <redoc spec-url='${redocOptions.specUrl}'></redoc>
        <script src="https://cdn.jsdelivr.net/npm/redoc@latest/bundles/redoc.standalone.js"> </script>
      </body>
    </html>
  `;

  app.getHttpAdapter().get('/api/redoc', (req: Request, res: Response) => {
    res.send(redocHtml);
  });

  // 4. 挂载 Scalar API Reference
  // 注意：@scalar/nestjs-api-reference 是 ESM 模块，在 CommonJS 项目中需要动态导入
  try {
    // 尝试直接使用 dynamic import，如果 tsconfig 配置正确 (nodenext)，应该会保留 import()
    // 如果仍然报错，可能需要回退到 eval hack，但我们先尝试最干净的方式
    const { apiReference } = await import('@scalar/nestjs-api-reference');

    app.use(
      '/api/reference',
      apiReference({
        theme: 'deepSpace',
        layout: 'modern',
        spec: {
          content: document,
        },
      } as ApiReferenceOptions),
    );
  } catch (error: any) {
    console.error('Failed to load Scalar API Reference:', error);
    // 降级方案：如果 Scalar 加载失败，至少提供一个 JSON 接口
    SwaggerModule.setup('api/docs', app, document);
  }
}
