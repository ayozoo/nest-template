# NestJS Enterprise Template (Advanced)

这是一个为大型应用设计的 NestJS 高级后端模板，集成了**仓储模式 (Repository Pattern)**、**智能类型推导 (Smart Relations)**、**结构化日志 (Structured Logging)** 以及**现代化 API 文档**。

旨在解决随着项目规模增长带来的代码耦合、类型丢失和维护困难问题。

## 🌟 核心特性

### 1. 极致的架构设计

- **Repository Pattern (仓储模式)**: 实现了真正的分层架构。Service 层不再依赖 TypeORM 的具体实现，而是依赖 `IRepository` 接口。
- **Generic Repository (泛型仓储)**: 提供 `BaseRepository<T>`，内置常见 CRUD 操作，支持软删除、分页等扩展。
- **Dependency Inversion (依赖倒置)**: 业务逻辑层与数据访问层彻底解耦，未来替换 ORM 或数据库引擎时，无需修改任何业务代码。

### 2. 🚀 Smart Relations (智能关联推导)

解决了 TypeORM 最大的痛点：**关联查询时的类型丢失**。
本模板独创 `findWithRelations` 方法，利用 TypeScript 递归类型推导，实现了类似 Prisma 的开发体验。

**对比：**

❌ **传统 TypeORM:**

```typescript
const user = await repo.findOne({ where: { id }, relations: { posts: true } });
//即使你查了 posts，TS 依然认为 user.posts 可能是 undefined
if (user.posts) {
  // 必须手动判空
  console.log(user.posts[0].title);
}
```

✅ **Smart Relations (本项目):**

```typescript
const user = await repo.findWithRelations({
  where: { id },
  relations: { posts: { comments: true } }, // 支持深层嵌套
});

// ✨ TypeScript 自动推导：
// 1. user.posts 是必选数组 (Array)
// 2. user.posts[0].comments 也是必选数组
console.log(user.posts[0].comments[0].content); // 直接访问，类型安全！
```

### 3. 🔍 全链路可观测性

- **Structured Logging (结构化日志)**: 生产环境输出 JSON 格式，方便 ELK/Datadog 收集。
- **Request Context Tracking**: 集成 `nestjs-cls`，自动为每个请求生成唯一的 `request_id`。无论日志在 Service 还是 Repository 打印，都能通过 `request_id` 串联整个调用链。
- **Automatic Metadata**: 自动记录请求耗时、URL、Method、Status Code、User Agent。

### 4. 📚 现代化 API 文档

抛弃传统的 Swagger UI，集成两款次世代文档工具：

- **Scalar API Reference**: `http://localhost:3000/api/reference`
  - OpenAI 风格的文档界面
  - 支持深色模式、多语言代码生成、交互式测试
- **Redoc**: `http://localhost:3000/api/redoc`
  - 适合复杂 API 结构展示
  - 极佳的三栏布局阅读体验

## 🛠️ 快速开始

### 1. 环境准备

- Node.js >= 18
- PostgreSQL

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 到 `.env` (如果没有则新建):

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=nest_template

# App
PORT=3000
NODE_ENV=development

# Logging
LOG_LEVEL=debug
```

### 4. 启动项目

```bash
# 开发模式 (Watch Mode)
npm run start:dev

# 生产模式
npm run start:prod
```

## 📂 目录结构说明

```
src/
├── bootstrap/           # 引导层：负责应用启动、全局配置、文档挂载
│   ├── setup-app.ts     # 全局管道、拦截器、过滤器配置
│   └── setup-documentation.ts # Scalar & Redoc 配置
├── modules/             # 业务模块层
│   └── users/
│       ├── users.controller.ts # 处理 HTTP 请求
│       ├── users.service.ts    # 纯业务逻辑 (不含 SQL)
│       └── users.repository.ts # 数据访问的具体实现
├── shared/              # 共享层 (核心架构代码)
│   ├── database/        # 数据库基础设施 (BaseRepository, BaseEntity)
│   ├── types/           # 高级类型工具 (SmartRelations)
│   ├── logging/         # 日志模块
│   └── interfaces/      # 核心接口定义
└── main.ts              # 入口文件
```

## 🎯 开发指南

### 如何新增一个模块？

1. **定义 Entity**: 继承 `BaseEntity`。
2. **定义 Repository 接口**: 继承 `IRepository<T>`。
3. **实现 Repository**: 继承 `BaseRepository<T>` 并实现接口。
4. **编写 Service**: 注入 Repository 接口（使用 `@InjectRepository` 或自定义 Token）。
5. **编写 Controller**: 调用 Service。

这种方式虽然初期代码量稍多，但能保证项目在拥有上百个模块时依然保持清晰的边界和极高的可维护性。
