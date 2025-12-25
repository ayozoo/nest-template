import { FindOptionsRelations } from 'typeorm';

// 辅助类型：提取数组中的元素类型
type Unpacked<T> = T extends (infer U)[] ? U : T;

// 辅助类型：判断是否为数组
type IsArray<T> = T extends any[] ? true : false;

/**
 * 核心魔法类型：根据 Relations 对象递归推导返回类型
 *
 * @template T 实体原始类型
 * @template R 关联关系配置对象 (FindOptionsRelations<T>)
 *
 * 原理：
 * 1. 遍历 R 中的每个 Key (即关联字段名)
 * 2. 如果 R[Key] 为 true，说明该关联被选中 -> 将 T[Key] 标记为 NonNullable (移除 undefined)
 * 3. 如果 R[Key] 为对象，说明有深层关联 -> 递归调用 SmartRelations
 * 4. 最后通过 & T 将推导出的强类型与原始类型合并
 */
export type SmartRelations<T, R extends FindOptionsRelations<T>> = T & {
  [K in keyof R]: K extends keyof T
    ? R[K] extends true
      ? NonNullable<T[K]>
      : R[K] extends object
        ? SmartRelations<
            NonNullable<Unpacked<T[K]>>,
            R[K]
          > extends infer DeepRes
          ? IsArray<NonNullable<T[K]>> extends true
            ? DeepRes[]
            : DeepRes
          : never
        : never
    : never;
};

/**
 * 字符串数组形式的推导（备用方案，支持 relations: ['posts', 'profile']）
 * 注意：字符串解析比较复杂且对 IDE 性能有一定影响，推荐优先使用对象风格
 */
// 这里暂时省略字符串解析版本，鼓励用户使用对象风格，更符合 Prisma 习惯
