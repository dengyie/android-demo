/**
 * 详情页 —— 动态路由页面
 *
 * 文件名 [id].tsx 中的方括号表示"动态路由参数"。
 * 比如访问 /detail/1 时 id="1"，/detail/2 时 id="2"。
 *
 * 这个页面根据不同的 id 渲染完全不同的内容：
 *   id="1" → 加载网络图片（含超时和错误处理）
 *   id="2" → 实时时钟（每秒更新）
 *   id="3" → 平台信息展示
 *
 * 这是一个"功能演示页面"，展示了 React Native 的多种能力。
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,        // 基础容器，类似 HTML 的 <div>
  Text,        // 文本组件
  Image,       // 图片组件，支持网络图片和本地图片
  StyleSheet,  // 样式工厂
  Platform,    // 平台信息 API，提供当前 OS / 版本
  ActivityIndicator, // 加载转圈指示器
} from 'react-native';

// useLocalSearchParams: 读取 URL 参数（如 /detail/1 → { id: "1" }）
// Stack: 用于动态修改当前页面的导航栏标题
import { useLocalSearchParams, Stack } from 'expo-router';

// FEATURES: 根据 id 查找功能数据
// FeatureIds: 常量，用于 switch-case 判断
import { FEATURES, FeatureIds } from '@/data/features';

// ============================================================
// 0. 辅助类型和函数
// ============================================================

/**
 * 扩展 Platform.constants 的类型
 *
 * Platform.constants 的类型定义比较保守，
 * 实际运行时还有一些值没有声明。
 * 这里手动扩展，让 TypeScript 不报错。
 *
 * systemName:     iOS 返回 "iOS"，Android 返回 "Android"
 * interfaceIdiom: 设备类型，如 "phone" / "tablet"
 */
interface ExtendedPlatformConstants {
  systemName?: string;
  interfaceIdiom?: string;
}

/**
 * formatTime —— 格式化时间为 "年-月-日 时:分:秒"
 *
 * padStart(2, '0') 确保个位数补零：
 *   1 → "01"，9 → "09"，10 → "10"
 *
 * 模板字符串 `${...}` 拼接各部分，
 * 比 "年" + y + "-月" 这种写法更清晰。
 */
function formatTime(date: Date): string {
  const y = date.getFullYear();      // 年：2026
  const M = String(date.getMonth() + 1).padStart(2, '0'); // 月：getMonth() 返回 0-11
  const d = String(date.getDate()).padStart(2, '0');      // 日
  const h = String(date.getHours()).padStart(2, '0');     // 时
  const m = String(date.getMinutes()).padStart(2, '0');   // 分
  const s = String(date.getSeconds()).padStart(2, '0');   // 秒
  return `${y}-${M}-${d} ${h}:${m}:${s}`;
}

// ============================================================
// 1. DetailScreen 组件
// ============================================================

export default function DetailScreen() {
  // ----------------------------------------------------------
  // 1a. 获取 URL 参数
  // ----------------------------------------------------------
  /**
   * useLocalSearchParams —— 读取动态路由参数
   *
   * <{ id: string }> 是泛型，告诉 TypeScript params 的类型。
   *
   * 如果 URL 是 /detail/1，则 { id } = { id: "1" }。
   * 注意：所有路由参数都是字符串类型！
   */
  const { id } = useLocalSearchParams<{ id: string }>();

  // ----------------------------------------------------------
  // 1b. 查找当前功能数据
  // ----------------------------------------------------------

  /**
   * Array.find() 返回数组中第一个满足条件的元素，
   * 如果找不到则返回 undefined。
   *
   * 这里用 id 匹配 FEATURES 中的对应项，
   * 拿到 title 用于导航栏动态标题。
   */
  const feature = FEATURES.find((f) => f.id === id);

  // ----------------------------------------------------------
  // 1c. 状态管理
  // ----------------------------------------------------------

  /**
   * useState —— React 的状态钩子
   *
   * 基本用法：const [值, 更新函数] = useState(初始值);
   *
   * currentTime:   当前时间，每秒更新一次（仅时钟功能使用）
   * imageLoading:  图片是否正在加载中
   * imageError:    图片是否加载失败
   */
  const [currentTime, setCurrentTime] = useState(new Date());
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  /**
   * useRef —— 创建一个"逃逸舱"来保存可变值
   *
   * 与 useState 的区别：
   *   - useState 更新会触发重新渲染
   *   - useRef 更新不会触发重新渲染
   *
   * 这里用来保存定时器 ID，以便在组件卸载时清除。
   * 如果不清理定时器，即使离开页面也会一直运行，造成内存泄漏。
   *
   * 泛型 <... | null> 表示值可以是 Timer 或 null（初始为 null）。
   */
  const imageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ============================================================
  // 2. 副作用处理
  // ============================================================

  /**
   * useEffect —— React 的副作用钩子
   *
   * "副作用" 指那些不直接渲染 UI 的操作，比如：
   *   - 设置定时器
   *   - 发起网络请求
   *   - 订阅事件
   *   - 操作 DOM / 原生组件
   *
   * 基本结构：useEffect(副作用函数, 依赖数组)
   *
   * 清理函数：
   *   副作用函数返回的函数会在两种情况下执行：
   *   1. 依赖变化，重新执行副作用之前
   *   2. 组件卸载（销毁）时
   *   这里返回 clearInterval(timer) 保证离开页面时停止计时。
   */

  // 时钟效果：id 为 CLOCK 时启动每秒更新
  useEffect(() => {
    // 只在时钟功能下运行，避免不必要的定时器
    if (id !== FeatureIds.CLOCK) return;

    // 立即更新一次当前时间
    setCurrentTime(new Date());

    // 每秒更新一次时间
    // setInterval 返回一个数字 ID，用于后续清除
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // 清理函数：离开页面时停止定时器
    // 如果不清理，即使用户返回到首页，定时器仍会运行
    return () => clearInterval(timer);
  }, [id]); // 依赖 id：id 变化时重新执行

  // 图片加载效果：id 为 IMAGE 时设置 15 秒超时
  useEffect(() => {
    if (id !== FeatureIds.IMAGE) return;

    // 重置加载状态
    setImageLoading(true);
    setImageError(false);

    // 15 秒超时：如果图片还没加载完，显示错误信息
    const timeout = setTimeout(() => {
      setImageLoading(false);
      setImageError(true);
    }, 15000);

    // 保存 timeout ID 到 ref，以便在 onLoad/onError 中手动清除
    imageTimeoutRef.current = timeout;

    // 清理函数：离开页面或 id 变化时清除超时
    return () => {
      if (imageTimeoutRef.current) {
        clearTimeout(imageTimeoutRef.current);
        imageTimeoutRef.current = null;
      }
    };
  }, [id]);

  // ============================================================
  // 3. 异常处理：功能不存在
  // ============================================================

  /**
   * 如果 FEATURES 中找不到对应 id 的数据，
   * 显示"功能未找到"错误提示。
   *
   * 这通常发生在用户手动修改 URL 访问了不存在的 id 时。
   */
  if (!feature) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>功能未找到</Text>
      </View>
    );
  }

  // ============================================================
  // 4. 内容渲染
  // ============================================================

  /**
   * renderContent —— 根据 id 渲染不同的内容区域
   *
   * 这是一个组件内部的普通函数（不是 React 组件），
   * 用 switch-case 根据功能 id 分派渲染逻辑。
   *
   * 为什么用 switch 而不是一堆 if-else？
   *   1. 可读性：每个 case 的含义一目了然
   *   2. 性能：switch 在 JS 引擎中通常被优化为跳转表
   *   3. 可维护：添加新功能只需加一个 case
   */
  const renderContent = () => {
    switch (id) {
      // --------------------------------------------------------
      // 功能 1：图片展示
      // --------------------------------------------------------
      case FeatureIds.IMAGE:
        // 如果图片加载失败，显示错误文字
        if (imageError) {
          return <Text style={styles.errorText}>图片加载失败</Text>;
        }
        return (
          /**
           * imageWrapper 包裹层：
           *   固定宽 300 x 高 200，让图片和加载指示器共享同一空间
           *
           * ActivityIndicator：
           *   加载转圈动画，只在 imageLoading 为 true 时显示
           *   size="large" 表示大号转圈
           *   color="#888888" 灰色，与整体风格一致
           *   使用绝对定位（position: 'absolute'）叠加在图片上方
           *
           * Image 组件：
           *   source={{ uri: '...' }}  从网络加载图片
           *   resizeMode="contain"     保持比例，完整显示在容器内
           *   onLoad                   图片加载成功时回调
           *   onError                  图片加载失败时回调
           *
           * 在 onLoad 和 onError 中都需要：
           *   1. 关闭加载指示器
           *   2. 清除 15 秒超时定时器（避免超时后把正确结果覆盖成"失败"）
           */
          <View style={styles.imageWrapper}>
            {imageLoading && (
              <ActivityIndicator
                size="large"
                color="#888888"
                style={styles.loader}
              />
            )}
            <Image
              source={{ uri: 'https://picsum.photos/600/400' }}
              style={styles.image}
              resizeMode="contain"
              onLoad={() => {
                setImageLoading(false);
                if (imageTimeoutRef.current) {
                  clearTimeout(imageTimeoutRef.current);
                  imageTimeoutRef.current = null;
                }
              }}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
                if (imageTimeoutRef.current) {
                  clearTimeout(imageTimeoutRef.current);
                  imageTimeoutRef.current = null;
                }
              }}
            />
          </View>
        );

      // --------------------------------------------------------
      // 功能 2：实时时钟
      // --------------------------------------------------------
      case FeatureIds.CLOCK:
        return (
          <Text style={styles.timeText}>
            {formatTime(currentTime)}   {/* 格式化后的时间字符串 */}
          </Text>
        );

      // --------------------------------------------------------
      // 功能 3：平台信息
      // --------------------------------------------------------
      case FeatureIds.PLATFORM: {
        // 类型断言：告诉 TypeScript 我们信任扩展的类型
        const constants = Platform.constants as ExtendedPlatformConstants;
        return (
          /**
           * 信息展示面板：
           *   infoLabel  → 字段名称（灰色小字）
           *   infoValue  → 字段值（黑色大字）
           *
           * Platform 对象的属性：
           *   Platform.OS        → 'android' | 'ios' | 'web'
           *   Platform.Version   → 系统版本号，如 '15' (iOS) 或 '34' (Android API Level)
           *   constants.systemName       → 人类可读的系统名称
           *   constants.interfaceIdiom   → 设备形态
           *
           * ?? 空值合并运算符：
           *   左边是 null 或 undefined 时使用右边的值。
           *   constants.systemName ?? 'N/A'
           *   如果系统没有返回这个值，显示 'N/A' 作为兜底。
           */
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>操作系统</Text>
            <Text style={styles.infoValue}>{Platform.OS}</Text>

            <Text style={styles.infoLabel}>系统版本</Text>
            <Text style={styles.infoValue}>{Platform.Version}</Text>

            <Text style={styles.infoLabel}>系统名称</Text>
            <Text style={styles.infoValue}>
              {constants.systemName ?? 'N/A'}
            </Text>

            <Text style={styles.infoLabel}>界面类型</Text>
            <Text style={styles.infoValue}>
              {constants.interfaceIdiom ?? 'N/A'}
            </Text>
          </View>
        );
      }

      // --------------------------------------------------------
      // 兜底：未知功能
      // --------------------------------------------------------
      default:
        return <Text style={styles.errorText}>未知功能</Text>;
    }
  };

  // ============================================================
  // 5. 最终渲染
  // ============================================================

  /**
   * Stack.Screen 嵌套在组件内部 → 动态设置导航栏标题
   *
   * 为什么不在 _layout.tsx 中设置？
   *   因为在 _layout.tsx 里还不知道当前是哪个功能，
   *   在这里能拿到 feature.title，实现动态标题。
   *
   * 整体布局：
   *   flex: 1            占满可用空间
   *   justifyContent     垂直居中
   *   alignItems         水平居中
   *   backgroundColor    浅灰背景
   *   padding: 20        内容不贴边
   */
  return (
    <>
      {/* 动态设置导航栏标题为当前功能名称 */}
      <Stack.Screen options={{ title: feature.title }} />

      {/* 内容区域 */}
      <View style={styles.container}>
        {renderContent()}
      </View>
    </>
  );
}

// ============================================================
// 6. 样式定义
// ============================================================

/**
 * 详情页样式
 *
 * Flexbox 布局说明：
 *   React Native 默认的 flexDirection 是 column（垂直排列），
 *   和 Web 默认的 row（水平排列）不同，这是一个常见陷阱。
 *
 *   居中技巧：
 *     justifyContent: 'center'  主轴居中（垂直）
 *     alignItems: 'center'      交叉轴居中（水平）
 *     + flex: 1 撑满父容器
 *     → 子元素在屏幕正中央
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,                        // 撑满整个可用空间
    justifyContent: 'center',       // 垂直居中
    alignItems: 'center',           // 水平居中
    backgroundColor: '#f5f5f5',     // 浅灰背景
    padding: 20,                    // 内边距，防止内容贴边
  },

  /**
   * imageWrapper —— 图片容器
   *
   * 固定宽高 300x200，让图片和加载指示器共享空间。
   * justifyContent & alignItems: center 让 ActivityIndicator 居中。
   */
  imageWrapper: {
    width: 300,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /**
   * image —— 图片本身
   *
   * borderRadius: 12  圆角，更现代
   * 宽高与容器一致
   */
  image: {
    width: 300,
    height: 200,
    borderRadius: 12,
  },

  /**
   * loader —— 加载指示器
   *
   * position: 'absolute'  脱离文档流，叠加在图片上方居中
   * 不加 top/left/right/bottom 时默认位于父容器左上角，
   * 依赖父容器的 justifyContent/alignItems 居中。
   */
  loader: {
    position: 'absolute',
  },

  /**
   * timeText —— 时钟数字
   *
   * fontSize: 28sp      大字，时钟在屏幕上很显眼
   * fontWeight: '700'   粗体
   * color: '#1a1a1a'   深灰色
   * fontVariant:        字体变体 —— tabular-nums 确保数字等宽，
   *                     避免时间变化时数字宽度跳来跳去
   */
  timeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    fontVariant: ['tabular-nums'],
  },

  /**
   * infoContainer —— 平台信息容器
   *
   * width: '100%'         满宽
   * paddingHorizontal: 20 左右留白，让内容不贴边
   */
  infoContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },

  /**
   * infoLabel —— 信息字段名
   *
   * fontSize: 14sp  比值小
   * color: '#888'   灰色，弱化层级
   * marginTop: 12   与上一项之间留间距
   */
  infoLabel: {
    fontSize: 14,
    color: '#888888',
    marginTop: 12,
  },

  /**
   * infoValue —— 信息字段值
   *
   * fontSize: 20sp    比标签大
   * fontWeight: '600' 半粗体
   * color: '#1a1a1a' 深色，突出显示
   * marginTop: 2      紧贴标签，只留 2dp 间距
   */
  infoValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 2,
  },

  /**
   * errorText —— 错误/兜底提示文字
   *
   * fontSize: 18sp  中等大小
   * color: '#999'   浅灰色，表示非正常内容
   */
  errorText: {
    fontSize: 18,
    color: '#999999',
  },
});
