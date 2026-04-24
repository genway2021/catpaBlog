# 部署指南

本指南将帮助您将 catpablog 项目（猫品安 | CATPA）部署到 GitHub Pages、Cloudflare Pages 和 Cloudflare Workers。

## 目录

- [前端部署](#前端部署)
  - [GitHub Pages 部署](#github-pages-部署)
  - [Cloudflare Pages 部署](#cloudflare-pages-部署)
- [后端部署](#后端部署)
  - [Cloudflare Workers 部署](#cloudflare-workers-部署)
- [数据库配置](#数据库配置)
- [环境变量配置](#环境变量配置)
- [完整部署流程](#完整部署流程)
- [注意事项](#注意事项)

## 前端部署

### GitHub Pages 部署

1. **配置 GitHub Actions 工作流**
   - 仓库中已包含 `.github/workflows/deploy-frontend.yml` 文件
   - 该工作流会在推送到 `main` 分支时自动构建并部署到 GitHub Pages

2. **启用 GitHub Pages**
   - 登录 GitHub 仓库
   - 进入 Settings → Pages
   - 选择 `gh-pages` 分支作为源
   - 保存配置

3. **触发部署**
   - 推送代码到 `main` 分支
   - 或在 GitHub Actions 页面手动触发 `Deploy Frontend` 工作流

### Cloudflare Pages 部署

1. **配置 GitHub Secrets**
   - 登录 GitHub 仓库
   - 进入 Settings → Secrets and variables → Actions
   - 添加以下 Secrets：
     - `CF_API_TOKEN`：Cloudflare API 令牌（需要编辑权限）
     - `CF_ACCOUNT_ID`：Cloudflare 账户 ID

2. **创建 Cloudflare Pages 项目**
   - 登录 Cloudflare 控制台
   - 进入 Pages → 创建项目
   - 连接 GitHub 仓库
   - 配置构建设置：
     - 构建命令：`npm run generate`
     - 输出目录：`.output/public`
     - 环境变量：无需特殊配置

3. **触发部署**
   - 推送代码到 `main` 分支，自动触发部署
   - 或在 GitHub Actions 页面手动触发 `Deploy Frontend` 工作流

## 后端部署

### Cloudflare Workers 部署

1. **配置 Wrangler**
   - 在 `server` 目录创建 `wrangler.toml` 文件
   - 配置示例：
     ```toml
     name = "catpablog-backend"
     type = "javascript"
     workers_dev = true
     main = "index.js"
     ```

2. **创建后端入口文件**
   - 在 `server` 目录创建 `index.js` 文件
   - 该文件将作为 Cloudflare Workers 的入口点

3. **部署后端**
   - 推送代码到 `main` 分支，自动触发部署
   - 或在 GitHub Actions 页面手动触发 `Deploy Backend` 工作流

## 数据库配置

### 选择数据库选项

1. **Cloudflare D1**（推荐）
   - Serverless SQLite 兼容数据库
   - 与 Cloudflare Workers 无缝集成
   - 配置步骤：
     - 登录 Cloudflare 控制台
     - 进入 D1 → 创建数据库
     - 在 Workers 配置中添加数据库绑定

2. **Supabase**
   - 托管 PostgreSQL 数据库
   - 提供完整的数据库功能
   - 配置步骤：
     - 注册 Supabase 账户
     - 创建项目和数据库
     - 获取连接字符串

3. **其他选项**
   - PlanetScale：Serverless MySQL 数据库
   - MongoDB Atlas：托管 MongoDB 服务

### 数据库迁移

- 项目包含 SQL 迁移文件，位于 `server/pkg/database/sql/` 目录
- 根据选择的数据库类型，执行相应的迁移脚本

## 环境变量配置

### 前端环境变量

在 Cloudflare Pages 中配置：
- `API_URL`：后端 API 地址
- `SITE_URL`：网站域名

### 后端环境变量

在 Cloudflare Workers 中配置：
- `DB_HOST`：数据库主机
- `DB_PORT`：数据库端口
- `DB_NAME`：数据库名称
- `DB_USER`：数据库用户
- `DB_PASSWORD`：数据库密码
- `JWT_SECRET`：JWT 密钥
- `SERVER_PORT`：服务器端口
- `SERVER_ALLOW_ORIGINS`：允许的跨域来源

## 完整部署流程

1. **准备工作**
   - 确保 GitHub 仓库已正确配置
   - 确保 Cloudflare 账户已设置
   - 准备数据库服务

2. **部署步骤**
   1. 推送代码到 `main` 分支
   2. 监控 GitHub Actions 工作流执行
   3. 检查部署结果：
      - 前端：GitHub Pages 和 Cloudflare Pages 部署状态
      - 后端：Cloudflare Workers 部署状态
   4. 配置域名和 SSL/TLS

3. **验证部署**
   - 访问前端网站，确认页面加载正常
   - 测试 API 接口，确认后端服务正常
   - 验证数据库连接，确认数据操作正常

## 注意事项

1. **构建优化**
   - 前端使用 `npm run generate` 生成静态站点，确保构建产物正确
   - 后端使用 Go 构建优化二进制文件，减少部署包大小

2. **安全配置**
   - 所有敏感信息通过 GitHub Secrets 管理
   - 数据库连接字符串等敏感信息通过环境变量配置
   - 启用 SSL/TLS 加密，确保数据传输安全

3. **部署验证**
   - 部署后检查网站是否正常访问
   - 测试 API 接口是否正常工作
   - 验证数据库连接是否成功

4. **监控和维护**
   - 配置 Cloudflare Analytics 监控网站性能
   - 设置错误监控和日志记录
   - 定期更新依赖和安全补丁

5. **故障排查**
   - 检查 GitHub Actions 工作流日志，定位构建错误
   - 检查 Cloudflare Pages/Workers 部署日志，定位部署错误
   - 检查数据库连接和配置，确保数据服务正常

## 常见问题

### 前端部署失败
- **问题**：构建失败
  **解决方案**：检查依赖安装是否成功，查看构建日志中的错误信息

- **问题**：部署后页面空白
  **解决方案**：检查路由配置，确保静态资源路径正确

### 后端部署失败
- **问题**：Workers 部署失败
  **解决方案**：检查 `wrangler.toml` 配置，查看部署日志中的错误信息

- **问题**：API 接口无响应
  **解决方案**：检查数据库连接，确保环境变量配置正确

### 数据库连接问题
- **问题**：无法连接数据库
  **解决方案**：检查数据库连接字符串，确保数据库服务正常运行

- **问题**：迁移失败
  **解决方案**：检查 SQL 迁移脚本，确保语法正确

## 联系支持

如果在部署过程中遇到任何问题，请参考项目文档或提交 GitHub Issue 获取支持。