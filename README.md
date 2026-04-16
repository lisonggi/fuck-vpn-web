# fuck-vpn-web

`fuck-vpn-web` 是 `fuck-vpn-server` 的 Web 管理控制台。它为插件、节点、密钥和订阅提供统一的操作界面，适合与后端配合使用。

相关项目：
- [fuck-vpn-server](https://github.com/lisonggi/fuck-vpn-server)
- [fuck-vpn-plugin-api](https://github.com/lisonggi/fuck-vpn-plugin-api)

## 功能概览

- 插件管理：查看插件列表、启用 / 停用插件
- 节点管理：实时查看节点状态、手动刷新节点数据
- 密钥管理：查看密钥状态、配置与生成信息
- 订阅管理：查询订阅项、获取订阅链接、查看使用情况
- 响应式 UI：适配常见桌面浏览器

## 技术栈

- React + TypeScript
- Vite
- React Router
- @tanstack/react-query
- Tailwind CSS

## 运行环境

- Node.js 18 或更高版本
- npm 10 或更高版本

## 本地运行

```bash
npm install
npm run dev
```

打开浏览器访问：

```text
http://localhost:5173
```

## 构建与预览

```bash
npm run build
npm run preview
```

## 后端对接

- 默认后端地址：`http://localhost:8080`
- 前端接口基础地址定义在 `src/api/Api.ts` 中的 `baseUrl`
- 建议先启动后端，再启动前端

## 目录说明

- `src/api`：后端接口封装与请求逻辑
- `src/components`：可复用 UI 组件
- `src/pages`：页面入口与路由页面
- `src/router`：路由配置
- `src/assets/icons`：图标组件

## 主要页面

- `/admin`：管理控制台主界面
- `/admin/settings`：安全设置页
- `/admin/:pluginId`：插件详细页
- `/404`：页面未找到

## 开发建议

- 使用 `npm run lint` 进行代码检查
- `AdminPage` 负责加载插件列表并构建侧边导航
- `PluginPage` 负责展示插件的节点、密钥与订阅数据

## 说明

本项目仅提供前端管理界面，需配合 `fuck-vpn-server` 后端一起使用。
