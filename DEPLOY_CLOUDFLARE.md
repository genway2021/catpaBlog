# Cloudflare Pages 部署配置

## 项目设置

1. **创建 Cloudflare Pages 项目**
   - 登录 Cloudflare 控制台
   - 进入 Pages → 创建项目
   - 连接 GitHub 仓库：`genway2021/catpaBlog`
   - 选择 `main` 分支

2. **构建设置**
   - 构建命令：`npm run generate`
   - 输出目录：`.output/public`
   - 环境变量：
     - `NODE_VERSION`: `20`
     - `NPM_VERSION`: `9`

## 环境变量配置

在 Cloudflare Pages 项目设置中添加以下环境变量：

### 前端环境变量
- `NUXT_PUBLIC_API_URL`: `https://api.catpablog.example.com/api/v1`
- `NUXT_SITE_URL`: `https://catpablog.example.com`

### 构建环境变量
- `NODE_ENV`: `production`
- `NPM_CONFIG_PRODUCTION`: `true`

## 域名配置

1. **添加自定义域名**
   - 进入 Cloudflare Pages 项目 → 自定义域名
   - 添加域名：`catpablog.example.com`
   - 按照提示更新 DNS 记录

2. **SSL/TLS 配置**
   - 确保 SSL/TLS 已启用
   - 选择 "完全" 或 "完全（严格）" 模式

## 部署流程

1. **触发部署**
   - 推送代码到 `main` 分支
   - 或在 GitHub Actions 页面手动触发 `Deploy Frontend` 工作流

2. **验证部署**
   - 访问 `https://catpablog.example.com`
   - 检查页面加载是否正常
   - 测试 API 调用是否成功

## 常见问题

### 构建失败
- **问题**：依赖安装失败
  **解决方案**：检查 `package.json` 和 `package-lock.json` 文件是否完整

- **问题**：构建命令执行失败
  **解决方案**：查看构建日志，检查 `nuxt.config.ts` 配置是否正确

### 部署后页面空白
- **问题**：路由配置问题
  **解决方案**：确保 `nuxt.config.ts` 中的路由配置正确

- **问题**：API 调用失败
  **解决方案**：检查 `NUXT_PUBLIC_API_URL` 环境变量是否正确设置

## 性能优化

1. **缓存配置**
   - 在 Cloudflare Pages 中启用 "智能预缓存"
   - 配置适当的缓存规则

2. **CDN 配置**
   - 启用 Cloudflare CDN 加速
   - 配置适当的边缘缓存策略

3. **图片优化**
   - 使用 Cloudflare Image Resizing
   - 确保图片格式优化（WebP/AVIF）

## 监控与维护

1. **部署监控**
   - 配置 GitHub Actions 通知
   - 设置 Cloudflare Pages 部署状态监控

2. **性能监控**
   - 启用 Cloudflare Analytics
   - 使用 Lighthouse 定期检查性能

3. **安全监控**
   - 启用 Cloudflare Security Center
   - 定期检查依赖安全性
