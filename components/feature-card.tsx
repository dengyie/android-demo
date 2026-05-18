/**
 * FeatureCard 组件 —— 功能列表中的可点击卡片
 *
 * 这是一个"展示型组件"（Presentational Component），
 * 只负责外观渲染和点击事件转发，不管理任何业务逻辑。
 *
 * 为什么单独抽成组件？
 *   1. 复用：同一张卡片可以在不同页面使用
 *   2. 隔离：修改卡片样式不影响首页逻辑
 *   3. 可测试：可以单独测试卡片的渲染和交互
 */

import React from 'react';
// Pressable: 可按压的容器组件，替代老旧的 TouchableOpacity
// Text: 文本组件，RN 中没有 <p> 标签，所有文字必须用 Text 包裹
// StyleSheet: 样式表工厂，性能优于内联对象（样式会被编译优化）
import { Pressable, Text, StyleSheet } from 'react-native';
// type 关键字表示"仅导入类型"，编译后不会出现在 JavaScript 产物中
import type { Feature } from '@/data/features';

// ============================================================
// 1. Props 类型定义
// ============================================================

/**
 * FeatureCardProps —— 组件接收的属性
 *
 * 继承 Feature 的所有属性（id, title, description），
 * 再加上点击回调 onPress。
 *
 * 为什么直接用 Feature 而不是 Omit<Feature, 'id'>？
 *   这样调用方无论用 <FeatureCard {...item} /> 展开
 *   还是逐属性传递都能通过类型检查，更灵活。
 *
 * onPress 类型 () => void 的含义：
 *   一个不接受参数、不返回值的函数。
 *   调用方传入点击处理逻辑，组件负责在用户点击时触发。
 */
type FeatureCardProps = Feature & {
  onPress: () => void;
};

// ============================================================
// 2. 组件实现
// ============================================================

/**
 * FeatureCard 函数组件
 *
 * React 组件就是一个返回 JSX 的函数。
 * 函数组件（Function Component）是 React 的主流写法，
 * 比 Class Component 更简洁。
 *
 * 参数解构 { title, description, onPress }：
 *   从 props 对象中提取需要的属性，
 *   id 虽然包含在 Feature 里但不在此组件中使用。
 *
 * export default 表示这是该文件的默认导出，
 * 导入时可以用任意名字：import Card from '@/components/feature-card'
 */
export default function FeatureCard({ title, description, onPress }: FeatureCardProps) {
  return (
    /**
     * Pressable —— 可检测按压状态的容器
     *
     * onPress:   点击时触发，传入的回调由父组件定义
     * style:     接受一个函数而非固定对象，
     *            函数接收 { pressed: boolean } 参数，
     *            pressed 为 true 时用户正在按压，
     *            这样可以实现"按下变暗"的反馈效果。
     */
    <Pressable
      style={({ pressed }) => [
        styles.card,            // 基础样式（始终应用）
        pressed && styles.pressed  // 按下的瞬间叠加半透明效果
      ]}
      onPress={onPress}
    >
      {/* 标题 —— 大字加粗 */}
      <Text style={styles.title}>{title}</Text>
      {/* 描述 —— 小字灰色 */}
      <Text style={styles.description}>{description}</Text>
    </Pressable>
  );
}

// ============================================================
// 3. 样式定义
// ============================================================

/**
 * StyleSheet.create() —— 创建样式表
 *
 * 为什么不用普通对象直接写 style={{ ... }}？
 *   - StyleSheet.create 会把样式编译成数字 ID，传给原生层更高效
 *   - 提供类型检查，写错属性名会报错
 *   - 样式在组件外部定义，不会每次渲染都创建新对象
 *
 * React Native 的样式是 CSS 的子集，
 * 使用驼峰命名（backgroundColor 而非 background-color），
 * 数值默认单位是 dp（密度无关像素）。
 */
const styles = StyleSheet.create({
  /**
   * card —— 卡片容器样式
   *
   * backgroundColor: 白色背景
   * borderRadius:    圆角 12dp，现代 UI 必备
   * padding:         内边距 20dp，让文字不贴边
   * marginHorizontal: 水平外边距 16dp，卡片左右留白
   * marginVertical:   垂直外边距 8dp，卡片之间有间距
   *
   * 阴影样式（两套写法，分别对应 iOS 和 Android）：
   *   iOS 用 shadow* 系列属性
   *   Android 用 elevation（图层高度，自动生成阴影）
   */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    // iOS 阴影
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Android 阴影
    elevation: 3,
  },

  /**
   * pressed —— 按压状态的附加样式
   *
   * opacity: 0.7 让卡片变半透明，
   * 用户能直观感受到"正在点击"的反馈。
   * 这是移动端最基本的交互体验。
   */
  pressed: {
    opacity: 0.7,
  },

  /**
   * title —— 卡片标题样式
   *
   * fontSize:   18sp（文字大小单位，随系统缩放）
   * fontWeight: '600' 表示半粗体（400=正常, 700=粗体）
   * color:      '#1a1a1a' 深灰色，比纯黑柔和
   * marginBottom: 标题和描述之间留 4dp 间距
   */
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },

  /**
   * description —— 卡片描述样式
   *
   * fontSize: 14sp，比标题小
   * color:    '#666666' 中灰色，层级感：标题 > 描述
   */
  description: {
    fontSize: 14,
    color: '#666666',
  },
});
