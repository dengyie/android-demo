# Appetize 上传 CI 链路 - 技术设计文档

## 概述

在现有 GitHub Actions 构建链路基础上，新增 APK 构建后自动上传到 Appetize 并生成浏览器预览链接的能力。

### 完整链路

```
GitHub Actions (push to main / workflow_dispatch)
  └─ build-android-apk  ← 现有，构建 APK
       └─ upload-artifact (app.apk)
  └─ upload-appetize     ← 新增
       ├─ 下载构建产物 (app.apk)
       ├─ 上传到 Appetize API
       └─ 生成浏览器预览链接 → GitHub Actions Summary
```

## Appetize API 集成

### 认证方式

Appetize 使用 API Token 认证，通过 URL 中的 HTTP Basic Auth 传递：

```
POST https://{TOKEN}@api.appetize.io/v1/apps
```

Token 存储在 GitHub Secrets 中，变量名 `APPETIZE_API_TOKEN`。

### 上传接口

| 项目 | 说明 |
|------|------|
| 方法 | `POST` |
| 端点 | `https://{TOKEN}@api.appetize.io/v1/apps` |
| Content-Type | `multipart/form-data` |
| 参数 | `file` (APK 二进制), `platform` ("android") |
| 超时 | 30s 连接 + 120s 总超时 |

### 响应结构

```json
{
  "publicKey": "xxx",
  "privateKey": "yyy",
  "created": "2026-05-18T00:00:00.000Z",
  "updated": "2026-05-18T00:00:00.000Z"
}
```

### 公开链接

- 直接预览：`https://appetize.io/app/{publicKey}`
- 嵌入链接：`https://appetize.io/embed/{publicKey}`

## GitHub Actions 设计

### Job 依赖关系

```
build-android-apk (现有)
  ↓ needs
upload-appetize (新增)
```

`upload-appetize` Job 通过 `needs: build-android-apk` 确保 APK 构建完成后再上传。

### 新增 Job 步骤

1. **下载产物** - 使用 `actions/download-artifact@v4` 下载 `android-apk`
2. **上传 Appetize** - 使用 `curl` 调用 Appetize API
3. **解析响应** - 使用 `jq` 提取 `publicKey`
4. **输出链接** - 写入 `$GITHUB_STEP_SUMMARY` 和 Job Summary

### 错误处理

- 上传失败不阻塞后续 Job（`continue-on-error: true`）
- 上传失败时在 Summary 中输出错误信息
- 不因上传失败影响 AAB 构建和 iOS 构建

### 触发条件

- `push` 到 `main` 分支：自动触发（与 APK 构建一致）
- `workflow_dispatch`：手动触发

## Secrets 配置

| Secret 名称 | 说明 | 获取方式 |
|------------|------|---------|
| `APPETIZE_API_TOKEN` | Appetize API Token | Appetize Dashboard → Account → API |

需在 GitHub 仓库 Settings → Secrets and variables → Actions 中添加。

## 变更文件清单

| 文件 | 操作 |
|------|------|
| `.github/workflows/build.yml` | 修改：新增 `upload-appetize` Job |

## 注意事项

1. Appetize 免费套餐有上传次数和并发限制，上传失败时不影响主构建流程
2. `curl` 使用 `--fail-with-body` 确保 HTTP 错误时能捕获响应体
3. `jq` 在 `ubuntu-latest` runner 中预装，无需额外安装
