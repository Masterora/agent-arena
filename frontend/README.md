# Agent Arena — 前端

基于 React 19 + TypeScript + Vite 7 + Tailwind CSS v4 构建的 AI 策略竞技场前端。

## 快速开始

```bash
npm install
npm run dev      # http://localhost:3000
```

后端需同步运行在 `http://localhost:9000`（见根目录 README）。

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（端口 3000，热重载） |
| `npm run build` | 生产构建，输出到 `dist/` |
| `npm run preview` | 预览构建产物 |
| `npm run lint` | ESLint 检查 |

## 目录结构

```
src/
├── api/            # Axios 请求封装（client / strategies / matches / market）
├── components/
│   ├── charts/     # Recharts 图表组件（Performance / Portfolio / Comparison / Radar / TradeDistribution）
│   ├── common/     # Button / Loading / Toast
│   ├── home/       # DashboardCharts
│   ├── layout/     # Header / Layout
│   ├── match/      # MatchCard / RunMatchForm
│   └── strategy/   # StrategyCard / StrategyForm / StrategyList / StrategyStatsChart
├── hooks/          # React Query 自定义 Hooks（useStrategies / useMatches / useToast）
├── pages/          # Home / Strategies / Matches / MatchDetail
├── types/          # TypeScript 类型（strategy.ts / match.ts）
└── utils/          # cn()（clsx + tailwind-merge）
```

## 技术栈

| 库 | 版本 | 用途 |
|---|---|---|
| React | 19 | UI 框架 |
| TypeScript | 5.9 | 类型系统 |
| Vite | 7 | 构建工具，dev proxy `/api` → `:9000` |
| Tailwind CSS | v4 | 原子化样式（`@tailwindcss/vite` 插件） |
| React Router | v7 | 客户端路由 |
| TanStack Query | v5 | 服务端状态管理与缓存 |
| Recharts | — | 数据可视化图表 |
| Zustand | — | 客户端轻量状态（Toast） |
| Axios | — | HTTP 客户端 |
| CSS Modules | — | 组件级样式隔离 |

## 样式规范

项目采用 **CSS Modules + Tailwind v4 `@apply`** 方案：

- 每个组件对应同目录下的 `组件名.module.css`
- 每个 `.module.css` 文件顶部必须声明：
  ```css
  @reference "../../index.css";
  ```
- `@apply` 中只能使用 **Tailwind 内置工具类**，不能使用 `index.css` 中定义的自定义类

## 页面路由

| 路径 | 页面 | 说明 |
|---|---|---|
| `/` | `Home` | 统计卡片 + 活动趋势图 + 策略分布 |
| `/strategies` | `Strategies` | 策略管理（创建/编辑/删除） |
| `/matches` | `Matches` | 比赛列表 + 发起新比赛 |
| `/matches/:id` | `MatchDetail` | 比赛详情：排名 + 5 个可视化图表 |

## 环境变量

| 变量 | 默认值 | 说明 |
|---|---|---|
| `VITE_API_URL` | `http://localhost:9000` | 后端地址（本地开发通常不需要设置，Vite proxy 已处理） |

复制 `.env.example` 为 `.env` 后按需修改。

详细架构说明见 [docs/development.md](../docs/development.md)。
