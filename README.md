<div align="center">
  <a href="https://github.com/talen8/FlecBlog">
    <img src=".github/images/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">FlecBlog</h3>

  <p align="center">
    一个现代化的全栈博客系统，集成了文章管理、评论互动、友链交换、动态发布、数据统计等完整功能。
    <br />
    <br />
    <a href="https://blog.talen.top">查看演示</a>
    &middot;
    <a href="https://github.com/talen8/FlecBlog/issues/new">问题反馈</a>
    &middot;
    <a href="">赞助支持</a>
    &middot;
    <a href="https://ccnlf8xcz6k3.feishu.cn/wiki/space/7618178485001046989">使用文档</a>
    &middot;
    <a href="https://qm.qq.com/q/Zzm9XN6lOi">社群讨论</a>
  </p>
</div>

![预览图](.github/images/preview.png)

## 架构设计

项目采用前后端分离架构，包含三个独立端：

- **Server** - 服务端，基于 Go + Gin + GORM 构建，提供 RESTful API 接口
- **Admin** - 管理端，基于 Vue 3 + Element Plus 构建，用于内容管理与数据统计
- **Blog** - 博客端，基于 Nuxt 4 构建，支持 SSR 服务端渲染与 SEO 优化

## 技术栈

### Server - 服务端

- **语言**: [Go 1.25](https://golang.org)
- **框架**: [Gin](https://github.com/gin-gonic/gin)
- **ORM**: [GORM](https://gorm.io)
- **数据库**: PostgreSQL
- **认证**: JWT (JSON Web Tokens), OAuth2, Goth
- **API 文档**: Swagger
- **定时任务**: [Cron](https://github.com/robfig/cron)
- **其他**: User-Agent 解析, 飞书 SDK, 微信公众号

### Admin - 管理端

- **框架**: [Vue 3](https://vuejs.org) + [Vite](https://vitejs.dev)
- **UI 组件**: [Element Plus](https://element-plus.org)
- **状态管理**: [VueUse](https://vueuse.org)
- **Markdown 编辑器**: CodeMirror 6
- **图表**: ECharts, echarts-wordcloud
- **其他**: TypeScript, Vue Router, Axios, dayjs, SCSS

![后台管理 - 仪表盘](.github/images/admin-dashboard.png)

![后台管理 - 编辑器](.github/images/admin-editor.png)

### Blog - 博客端

- **框架**: [Nuxt 4](https://nuxt.com) - Vue.js 全栈框架
- **文章渲染**: markdown-it, Highlight.js, Mermaid
- **样式**: SCSS
- **SEO**: @nuxtjs/seo, Sitemap, Atom Feed
- **PWA**: @vite-pwa/nuxt
- **其他**: TypeScript, VueUse, dayjs, Lenis, medium-zoom, APlayer

![博客前台 - 首页](.github/images/blog-home.png)

![博客前台 - 文章详情](.github/images/blog-article.png)

## 快速部署

### Docker Compose 一键部署 (推荐)

1. 创建 `.env` 文件：

```env
# Database Configuration
DB_PASSWORD=your_database_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Site Configuration
API_URL=https://api.yourdomain.com/api/v1
```

2. 创建 `docker-compose.yml` 文件：

```yaml
services:
  server:
    image: talen8/flec-server:latest
    container_name: flec_server
    restart: unless-stopped
    environment:
      DB_HOST: localhost
      DB_PORT: 5432
      DB_NAME: postgres
      DB_USER: postgres
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "8080:8080"
    volumes:
      - /srv/flecblog:/app/data
    networks:
      - flec-network

  blog:
    image: talen8/flec-blog:latest
    container_name: flec_blog
    restart: unless-stopped
    environment:
      NUXT_PUBLIC_API_URL: ${API_URL}
    ports:
      - "3000:3000"
    networks:
      - flec-network
    depends_on:
      - server

  admin:
    image: talen8/flec-admin:latest
    container_name: flec_admin
    restart: unless-stopped
    environment:
      API_URL: ${API_URL}
    ports:
      - "4000:4000"
    networks:
      - flec-network
    depends_on:
      - server

networks:
  flec-network:
    driver: bridge
```

<details>
<summary>包含 PostgreSQL 的完整配置（点击展开）</summary>

```yaml
services:
  postgres:
    image: postgres:15-alpine
    container_name: flec_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - flec-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  server:
    image: talen8/flec-server:latest
    container_name: flec_server
    restart: unless-stopped
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: postgres
      DB_USER: postgres
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "8080:8080"
    volumes:
      - /srv/flecblog:/app/data
    networks:
      - flec-network
    depends_on:
      postgres:
        condition: service_healthy

  blog:
    image: talen8/flec-blog:latest
    container_name: flec_blog
    restart: unless-stopped
    environment:
      NUXT_PUBLIC_API_URL: ${API_URL}
    ports:
      - "3000:3000"
    networks:
      - flec-network
    depends_on:
      - server

  admin:
    image: talen8/flec-admin:latest
    container_name: flec_admin
    restart: unless-stopped
    environment:
      API_URL: ${API_URL}
    ports:
      - "4000:4000"
    networks:
      - flec-network
    depends_on:
      - server

networks:
  flec-network:
    driver: bridge

volumes:
  postgres_data:
```

</details>

3. 启动服务：

```bash
docker-compose up -d
```

### 访问地址

| 服务 | 地址 |
|------|------|
| 博客端 | http://localhost:3000 |
| 管理端 | http://localhost:4000 |
| API 文档 | http://localhost:8080/swagger/index.html |

## 从源码运行

### 前置要求

- Node.js 20+ (admin, blog)
- Go 1.25+ (server)
- PostgreSQL 12+ (server)

### 数据库准备

需要先安装并配置 PostgreSQL 数据库（12+），创建数据库和用户。

应用会在首次启动时自动执行 `pkg/database/sql/init_database.sql` 初始化数据库，包括创建表结构和初始数据。

> ⚠️ **PostgreSQL 15+ 权限配置**：如果使用 PostgreSQL 15 或更高版本，且数据库用户不是 `postgres`（超级用户），需要额外配置 schema 权限：
>
> ```bash
> sudo -i -u postgres
> psql -U postgres -d <数据库名> -c "GRANT CREATE ON SCHEMA public TO <用户名>;"
> ```
>
> PostgreSQL 15+ 默认限制了普通用户在 public schema 上的创建权限，上述命令会授予必要的权限。

### Server

```bash
cd server
go mod download
cp .env.example .env
# 编辑 .env 配置数据库连接
go run cmd/main.go
```

### Admin

```bash
cd admin
npm install
cp .env.example .env
# 编辑 .env 配置 API 地址
npm run dev
```

### Blog

```bash
cd blog
npm install
cp .env.example .env
# 编辑 .env 配置 API 地址
npm run dev
```

## 配置说明

### Server 环境变量

```env
# JWT 配置
JWT_SECRET=your_jwt_secret_key

# 服务器配置
SERVER_PORT=8080
SERVER_ALLOW_ORIGINS=*

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_database_password
```

### Admin 环境变量

```env
VITE_API_URL=https://api.yourdomain.com/api/v1
```

### Blog 环境变量

```env
NUXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

## 特性

### SSR 服务端渲染

Blog 端采用 Nuxt 4 的 SSR 模式，提供：

- 更好的 SEO 优化，搜索引擎可直接抓取完整内容
- 更快的首屏加载速度
- 更好的用户体验

### SEO 优化

集成完整的 SEO 功能：

- 动态 sitemap.xml
- robots.txt
- Atom Feed 订阅
- Open Graph 标签
- 结构化数据

### API 文档

服务启动后，访问以下地址查看 API 文档：

```
http://localhost:8080/swagger/index.html
```

## 目录结构详情

### Server

```
server/
├── api/              # API 定义
│   ├── middleware/   # 中间件 (认证、CORS、日志、限流、RBAC等)
│   ├── router/       # 路由配置
│   └── v1/           # API v1 版本接口
├── cmd/              # 应用入口
│   └── main.go
├── config/           # 配置管理
├── docs/             # Swagger 生成的文档
├── internal/         # 内部业务逻辑
│   ├── dto/          # 数据传输对象
│   ├── model/        # 数据模型
│   ├── repository/   # 数据访问层
│   └── service/      # 业务逻辑层
├── pkg/              # 可复用的包
├── templates/        # 模板文件
├── Dockerfile
└── go.mod
```

### Admin

```
admin/
├── src/
│   ├── api/              # API 接口
│   ├── assets/           # 静态资源
│   ├── components/       # 公共组件
│   ├── layouts/          # 页面布局
│   ├── router/           # 路由配置
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # 工具函数
│   ├── views/            # 页面组件
│   ├── App.vue           # 根组件
│   └── main.ts           # 入口文件
├── public/               # 公共文件
├── index.html            # HTML 模板
├── vite.config.ts        # Vite 配置
├── nginx.conf            # Nginx 配置
└── Dockerfile            # Docker 配置
```

### Blog

```
blog/
├── app/                  # 应用主目录
│   ├── assets/           # 静态资源
│   ├── components/       # Vue 组件
│   ├── composables/      # 组合式函数
│   ├── layouts/          # 页面布局
│   ├── pages/            # 页面路由
│   ├── plugins/          # Nuxt 插件
│   ├── utils/            # 工具函数
│   └── app.vue           # 根组件
├── public/               # 公共文件
├── server/               # 服务端代码
│   ├── plugins/          # 服务端插件
│   └── routes/           # API 路由
├── types/                # TypeScript 类型定义
├── nuxt.config.ts        # Nuxt 配置
└── Dockerfile            # Docker 配置
```

## 贡献

欢迎提交 Issue 和 Pull Request!

## 许可证

[MIT License](LICENSE)

## 联系方式

如有问题，请通过以下方式联系：

- Email: [talen2004@163.com](mailto:talen2004@163.com)
- Issues: [GitHub Issues](https://github.com/talen8/FlecBlog/issues)
