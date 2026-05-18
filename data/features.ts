/**
 * 功能数据层
 *
 * 这里定义了整个应用的数据模型和内容。
 * 遵循"关注点分离"原则：
 *   - 数据定义放在 data/ 目录
 *   - UI 组件放在 components/ 目录
 *   - 页面放在 app/ 目录
 *
 * 好处：修改数据不会影响 UI，修改 UI 不影响数据。
 */

// ============================================================
// 1. 类型定义
// ============================================================

/**
 * Feature 接口 —— 描述一个功能项的"形状"
 *
 * TypeScript 的 interface 定义了对象必须有哪些属性，
 * 以及每个属性的类型是什么。这提供了编译时的类型检查，
 * 防止我们不小心传错数据。
 *
 * 属性说明：
 *   id          - 唯一标识符，用于路由跳转和列表 key
 *   title       - 功能名称，显示在卡片上
 *   description - 功能描述，显示在卡片副标题
 */
export interface Feature {
  id: string;
  title: string;
  description: string;
}

// ============================================================
// 2. Feature ID 常量
// ============================================================

/**
 * FeatureIds —— 用有意义的常量名代替魔法字符串
 *
 * 为什么要这样做？
 *   在 detail/[id].tsx 中需要根据 id 判断渲染什么内容，
 *   如果用硬编码字符串 like if (id === '1')，
 *   时间长了会忘记 '1' 代表什么。用常量 FeatureIds.IMAGE
 *   一目了然。
 *
 * "as const" 的作用：
 *   告诉 TypeScript 这是一个只读常量对象，值不可修改。
 *   不加 as const 的话 TypeScript 会推断为 { IMAGE: string }，
 *   加上后推断为 { readonly IMAGE: "1" }，更精确。
 */
export const FeatureIds = {
  IMAGE: '1',     // 图片展示功能
  CLOCK: '2',     // 实时时钟功能
  PLATFORM: '3',  // 平台信息功能
} as const;

// ============================================================
// 3. 功能数据列表
// ============================================================

/**
 * FEATURES —— 所有功能项的数组
 *
 * 这是应用的核心数据源。
 * 首页 FlatList 遍历这个数组生成功能卡片列表，
 * 详情页根据点击的卡片 id 找到对应功能并渲染。
 *
 * 添加新功能只需在这里新增一个对象，
 * 并在 detail/[id].tsx 中补充渲染逻辑即可。
 */
export const FEATURES: Feature[] = [
  {
    id: FeatureIds.IMAGE,
    title: '图片展示',
    description: '展示一张网络图片',
  },
  {
    id: FeatureIds.CLOCK,
    title: '当前时间',
    description: '实时显示当前系统时间',
  },
  {
    id: FeatureIds.PLATFORM,
    title: '平台信息',
    description: '展示当前移动平台系统信息',
  },
];
