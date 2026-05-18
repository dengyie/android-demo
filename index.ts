/**
 * 应用入口文件
 *
 * 这是整个 Expo 应用的启动点。
 * "expo-router/entry" 会接管渲染流程，
 * 自动根据 app/ 目录下的文件结构生成导航路由。
 *
 * 工作原理：
 *   app/index.tsx         →  路径 "/"（首页）
 *   app/detail/[id].tsx   →  路径 "/detail/123"（动态路由）
 *   app/_layout.tsx       →  根布局，包裹所有页面
 *
 * 类似于 Next.js 的 pages/ 目录，但这是 React Native。
 */
import 'expo-router/entry';
