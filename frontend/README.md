# Agent Arena — 前端

基于 React 19 + TypeScript + Vite 7 + Tailwind CSS v4 构建的 AI 策略竞技场前端。

## 开发

```bash
npm install
npm run dev      # http://localhost:3000
```

## 构建

```bash
npm run build    # 输出到 dist/
npm run preview  # 预览构建产物
```

## 技术栈

- **React 19** + **TypeScript 5.9**
- **Vite 7**（dev server 端口 3000，proxy `/api` → `localhost:9000`）
- **Tailwind CSS v4**（`@tailwindcss/vite` 插件）
- **React Router v7** — 客户端路由
- **TanStack Query v5** — 服务端状态管理
- **Recharts** — 数据可视化
- **Zustand** — 轻量客户端状态（Toast）
- **Axios** — HTTP 客户端
- **CSS Modules** — 组件级样式隔离

详细开发说明见根目录 [docs/development.md](../docs/development.md)。


This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

