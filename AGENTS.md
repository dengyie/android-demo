# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

# 构建与 CI 规则

## GitHub Actions 触发间隔

- 触发 GitHub Actions 打包时，禁止硬编码 `sleep 60` 等待。
- 必须在内存中维护一个「上次打包时间」的时间戳（变量名如 `last_build_ts`），每次触发前计算当前时间与上次打包时间的差值。
- 仅当差值 ≥ 60 秒时才允许触发下一次打包；不足 60 秒则计算剩余等待时间并精确等待该时长。

## 打包失败处理

- 打包失败后，禁止直接重试打包。必须先执行以下步骤：
  1. 使用 Chrome 浏览器（chrome 插件/skill）打开 GitHub 仓库的 Actions 页面，定位到失败的 workflow run。
  2. 查看完整的构建日志，定位失败原因（编译错误、依赖缺失、配置问题等）。
  3. 根据日志中的错误信息修改代码/配置，修复根因。
  4. 确认修复完成后，再触发下一次打包。
- 禁止跳过日志分析直接重试，避免浪费构建资源。

# ⚠️ 构建计费红线（最高优先级）

- **所有 `eas build` 命令必须带 `--local` 参数**，严禁使用 EAS 云端构建。
- 正确格式：`eas build --local --platform <platform> --profile <profile> --non-interactive`
- 违反此规则会产生 EAS 按次计费，这是不可接受的。
- 修改 `build.yml` 或任何 CI 配置时，必须逐行确认 `--local` 未被遗漏。
