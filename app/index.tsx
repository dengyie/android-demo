/**
 * 首页 —— 功能列表
 *
 * 这是用户打开 App 看到的第一个页面。
 * 展示一个可滚动的功能卡片列表，点击卡片跳转到详情页。
 *
 * 文件名为 index.tsx，对应路由路径 "/"。
 * 这是 Expo Router 的惯例：index 文件就是目录的默认页面。
 */

import React, { useCallback } from 'react';

// FlatList: 高性能列表组件，只渲染屏幕可见区域的元素
//           （虚拟列表/懒加载），适合长列表
// StyleSheet: 样式工厂
import { FlatList, StyleSheet } from 'react-native';

// useRouter: Expo Router 的导航钩子，类似 Next.js 的 useRouter
import { useRouter } from 'expo-router';

// @/ 别名指向项目根目录（tsconfig.json 中 paths 配置）
import FeatureCard from '@/components/feature-card';

// FEATURES: 功能数据数组
// type Feature: TypeScript 类型（type 关键字导入，编译后消失）
import { FEATURES, type Feature } from '@/data/features';

/**
 * HomeScreen 函数组件 —— 首页
 */
export default function HomeScreen() {
  // ============================================================
  // 1. 获取路由器
  // ============================================================
  /**
   * useRouter() 返回一个路由器对象，提供导航方法：
   *   router.push('/path')    → 跳转到新页面（可返回）
   *   router.replace('/path') → 替换当前页面（不可返回）
   *   router.back()           → 返回上一页
   */
  const router = useRouter();

  // ============================================================
  // 2. 定义列表项渲染函数
  // ============================================================

  /**
   * useCallback —— 性能优化钩子
   *
   * 作用：缓存函数引用，避免每次父组件重渲染时创建新函数。
   *
   * 第一个参数：要缓存的函数
   *   接收 FlatList 传入的 { item } 对象，
   *   item 就是 FEATURES 数组中的一个 Feature 元素。
   *
   * 第二个参数：依赖数组 [router]
   *   只有 router 变化时才重新创建函数，
   *   避免了不必要的 FeatureCard 重新渲染。
   *
   * 函数体：
   *   渲染一个 FeatureCard 组件，
   *   点击时调用 router.push 跳转到 /detail/功能id
   */
  const renderItem = useCallback(
    ({ item }: { item: Feature }) => (
      <FeatureCard
        title={item.title}              // 卡片标题
        description={item.description}  // 卡片描述
        onPress={() =>
          router.push(`/detail/${item.id}`)  // 点击跳转详情页
        }
      />
    ),
    [router],  // 依赖项：router 变化时重建函数
  );

  // ============================================================
  // 3. 渲染列表
  // ============================================================

  /**
   * FlatList 核心属性说明：
   *
   * data={FEATURES}
   *   数据源，一个数组。
   *   每个元素会被传递给 renderItem 函数。
   *
   * keyExtractor={(item) => item.id}
   *   告诉 React 如何区分列表中的每一项。
   *   必须返回全局唯一的字符串，通常用数据的 id。
   *   正确设置 key 可以避免渲染错乱和性能浪费。
   *
   * contentContainerStyle={styles.container}
   *   列表内容容器的样式（不是列表本身）。
   *   这里设置内边距和背景色。
   *
   *   ⚠️ React Native 中 FlatList 的 style 和 contentContainerStyle 有区别：
   *      style        → 列表容器（滚动区域）
   *      contentContainerStyle → 内容包裹层（影响 padding/flex）
   *
   * renderItem={renderItem}
   *   列表中每一项的渲染函数。
   *   这里传的是用 useCallback 缓存的函数引用。
   */
  return (
    <FlatList
      data={FEATURES}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      renderItem={renderItem}
    />
  );
}

// ============================================================
// 4. 样式定义
// ============================================================

/**
 * 首页样式
 *
 * container:
 *   paddingVertical: 16   上下各留 16dp 空白
 *   backgroundColor: 浅灰背景 (#f5f5f5)，让白色卡片凸显出来
 *   flexGrow: 1           列表内容不足一屏时撑满整个屏幕
 *                          （确保浅灰背景覆盖全屏，避免底部留白）
 */
const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: '#f5f5f5',
    flexGrow: 1,
  },
});
