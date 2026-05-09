# HeroUI Placeholder API Monorepo

一个基于 npm workspaces 的前端 monorepo 示例，使用 HeroUI + React + Vite，对接 JSONPlaceholder 风格接口实现登录演示和 Post 管理。

## 目录

- `apps/web`: React + Vite + HeroUI 前端应用

## 功能

- 登录页：调用 `/users` 获取用户，使用用户名或邮箱匹配用户
- Post 列表：调用 `/posts` 获取文章列表
- Post 新增、编辑、删除：调用 `/posts` 的 POST、PATCH、DELETE 接口
- 本地会话保存：刷新页面后保留登录状态

> JSONPlaceholder 不提供真实鉴权，也不会持久保存写入数据。本示例使用固定演示密码 `demo123`，并在前端维护创建、编辑、删除后的页面状态。

## 快速开始

```bash
npm install
npm run dev:web
```

默认登录信息：

- 用户名：`Bret`
- 密码：`demo123`

Web 默认运行在 `http://localhost:5173`。

## 常用命令

```bash
npm run build       # 构建所有 workspace
npm run dev:web     # 启动前端开发服务
npm run preview:web # 预览构建产物
```

## 环境变量

复制 `apps/web/.env.example` 为 `apps/web/.env` 后可配置：

- `VITE_API_URL`: Placeholder API 地址，默认 `https://jsonplaceholder.typicode.com`
```
