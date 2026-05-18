/**
 * 根布局 —— 整个应用的导航框架
 *
 * Expo Router 约定 _layout.tsx 为布局文件，
 * 它定义了一个"包装器"包裹所有子页面。
 *
 * 类比：这是 React Native 版的 <html><body>，
 * 所有页面都在这个框架内渲染。
 *
 * 文件名 _layout 中的下划线表示"布局文件"，
 * Expo Router 不会把它当作一个可访问的页面路由。
 */

import React from 'react';

// Stack: 堆叠式导航器 —— 页面像一叠卡片，新页面从右侧滑入，返回时滑出
//      这是最常见的移动端导航模式（iOS 的 UINavigationController）
import { Stack } from 'expo-router';

// StatusBar: 控制手机顶部状态栏（时间、电量、信号那行）
//            style="dark" 表示浅色背景 + 深色文字（适合白色主题）
import { StatusBar } from 'expo-status-bar';

/**
 * RootLayout 函数组件
 *
 * React 中的 Fragment 概念：
 *   <>...</> 是 React.Fragment 的简写，
 *   允许返回多个元素但不会产生多余的 DOM/View 节点。
 *
 * 结构：
 *   1. <StatusBar />      设置状态栏样式（只渲染一次）
 *   2. <Stack>            导航控制器
 *        <Stack.Screen />  注册每个页面路由
 *
 * Stack.Screen 的配置：
 *   name="index"          文件是 app/index.tsx
 *   options={{ title }}   导航栏标题文字
 *
 *   对于 detail/[id]，标题会由详情页动态设置，
 *   这里的 "详情" 仅在加载瞬间显示。
 */
export default function RootLayout() {
  return (
    <>
      {/* 状态栏：深色文字风格，适配浅色背景 */}
      <StatusBar style="dark" />

      {/* Stack 导航器：管理页面堆栈 */}
      <Stack>
        {/* 首页路由 */}
        <Stack.Screen name="index" options={{ title: '功能列表' }} />

        {/* 详情页路由（动态路由 [id]） */}
        <Stack.Screen name="detail/[id]" options={{ title: '详情' }} />
      </Stack>
    </>
  );
}
