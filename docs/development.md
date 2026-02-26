# Agent Arena — 开发者文档

## 目录

1. [架构概览](#1-架构概览)
2. [后端](#2-后端)
   - [目录结构](#21-目录结构)
   - [配置系统](#22-配置系统)
   - [数据库](#23-数据库)
   - [API 接口](#24-api-接口)
   - [比赛引擎](#25-比赛引擎)
   - [行情数据](#26-行情数据)
   - [策略系统](#27-策略系统)
3. [前端](#3-前端)
   - [目录结构](#31-目录结构)
   - [路由与页面](#32-路由与页面)
   - [组件体系](#33-组件体系)
   - [CSS Modules](#34-css-modules)
   - [数据获取](#35-数据获取)
   - [类型系统](#36-类型系统)
4. [数据流](#4-数据流)
5. [环境变量参考](#5-环境变量参考)
6. [数据库迁移](#6-数据库迁移)
7. [部署](#7-部署)
8. [开发规范](#8-开发规范)

---

## 1. 架构概览

```
┌─────────────────┐        HTTP/JSON          ┌──────────────────────┐
│  React 前端     │  ──── /api/* (proxy) ──▶  │  FastAPI 后端        │
│  :3000          │                           │  :9000               │
│  Vite + TS      │                           │  SQLAlchemy ORM      │
└─────────────────┘                           └──────────┬───────────┘
                                                         │
                                              ┌──────────▼───────────┐
                                              │  数据库               │
                                              │  SQLite（开发）       │
                                              │  PostgreSQL（生产）   │
                                              └──────────────────────┘
```

- 前端通过 Vite `proxy` 将 `/api/*` 请求转发到后端，开发环境无需处理跨域
- 生产环境由 Nginx 或 Docker 网络直接通信

---

## 2. 后端

### 2.1 目录结构

```
backend/app/
├── main.py            # FastAPI 应用入口，注册路由、中间件、lifespan
├── config.py          # pydantic-settings 配置（读取 .env）
├── database.py        # SQLAlchemy engine / session / init_db
├── api/
│   ├── strategies.py  # /api/strategies 路由
│   ├── matches.py     # /api/matches 路由
│   └── market.py      # /api/market 路由
├── core/
│   ├── match_engine.py    # 比赛主循环
│   └── market_data.py     # 行情生成器 & CoinGecko 封装
├── db/
│   ├── models.py      # SQLAlchemy ORM 模型
│   └── crud.py        # StrategyCRUD / MatchCRUD
├── models/
│   ├── strategy.py    # Pydantic 响应模型
│   ├── match.py       # Pydantic 响应模型
│   └── portfolio.py   # 组合状态模型
└── strategies/
    ├── base.py        # BaseStrategy 抽象基类
    └── templates.py   # 内置策略实现
```

### 2.2 配置系统

`app/config.py` 使用 `pydantic-settings`，所有字段可通过同名环境变量覆盖：

```python
settings.database_url   # 数据库连接串
settings.cors_origins   # 允许的跨域来源列表
settings.port           # 服务端口
settings.secret_key     # JWT 签名密钥
```

运行时自动读取 `backend/.env`（或系统环境变量）。

### 2.3 数据库

**ORM 模型**（`db/models.py`）：

| 表 | 说明 |
|---|---|
| `strategies` | 策略定义：名称、类型、参数 JSON、统计信息 |
| `matches` | 比赛记录：状态、配置 JSON、参与者 JSON |
| `match_logs` | 执行日志：每 10 步快照，`data.logs` 含各策略持仓 |

**开发环境**使用 SQLite，路径 `backend/data/agent_arena.db`，首次启动自动创建。

**生产环境**切换 `DATABASE_URL` 为 PostgreSQL 连接串即可，无需修改代码。

### 2.4 API 接口

#### 策略（`/api/strategies`）

| 方法 | 路径 | 说明 |
|---|---|---|
| `POST` | `/` | 创建策略 |
| `GET` | `/` | 获取策略列表 |
| `GET` | `/{id}` | 获取单个策略 |
| `PUT` | `/{id}` | 更新策略 |
| `DELETE` | `/{id}` | 删除策略 |

**创建策略请求体：**
```json
{
  "name": "我的均值回归",
  "type": "mean_reversion",
  "params": {
    "lookback_period": 20,
    "buy_threshold": 0.97,
    "sell_threshold": 1.03,
    "position_size": 0.2,
    "max_position_pct": 0.5
  }
}
```

`type` 可选值：`mean_reversion` · `momentum` · `dca` · `custom`

---

#### 比赛（`/api/matches`）

| 方法 | 路径 | 说明 |
|---|---|---|
| `POST` | `/run` | 创建并运行比赛 |
| `GET` | `/` | 获取比赛列表 |
| `GET` | `/{id}` | 获取比赛详情（`?include_logs=true` 含执行日志） |
| `DELETE` | `/{id}` | 删除比赛 |

**运行比赛请求体：**
```json
{
  "strategy_ids": ["id1", "id2"],
  "market_source": "simulated",
  "market_type": "random",
  "coin_id": "ethereum",
  "duration_steps": 100,
  "initial_capital": 10000
}
```

`market_source` 可选值：`simulated` · `coingecko_historical` · `coingecko_realtime`

**比赛详情响应（含日志）：**
```json
{
  "id": "...",
  "status": "completed",
  "config": { "initial_capital": 10000, "trading_pair": "ETH/USDC", "duration_steps": 100 },
  "participants": [
    { "strategy_id": "...", "strategy_name": "...", "rank": 1, "return_pct": 5.23, "total_trades": 18, "win_trades": 12 }
  ],
  "logs": [
    {
      "step": 10,
      "data": {
        "logs": [
          { "step": 10, "strategy_id": "...", "action": { "type": "buy" }, "portfolio": { "cash": 8000, "positions": {}, "total_value": 10520 }, "price": 3200 }
        ]
      }
    }
  ]
}
```

---

#### 行情（`/api/market`）

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/coins` | 获取 CoinGecko 支持的币种列表 |
| `GET` | `/price/{coin_id}` | 获取单币实时价格 |

---

### 2.5 比赛引擎

`core/match_engine.py` — `MatchEngine` 类：

1. **初始化**：为每个参与策略创建独立 `Portfolio`（持仓 + 现金）
2. **主循环**：每步向所有策略提供相同行情数据 → 策略返回 `action` → 执行交易 → 更新持仓
3. **日志**：每 10 步调用 `MatchCRUD.add_log()` 快照所有策略的持仓状态
4. **结算**：循环结束后按最终 `total_value` 排名，写回数据库

### 2.6 行情数据

`core/market_data.py` 提供两类数据源：

**`MarketDataGenerator`**（模拟）：
- `random` — 随机游走
- `trending` — 带偏置的上涨趋势
- `ranging` — 均值回归型震荡

**`CoinGeckoFetcher`**（真实）：
- `historical` — 过去 30 天 OHLC 数据
- `realtime` — 最近 24h OHLC 数据
- 免费 API，无需 key

### 2.7 策略系统

所有策略继承 `strategies/base.py::BaseStrategy`，实现 `execute(market_data, portfolio)` 方法，返回：

```python
{ "type": "buy" | "sell" | "hold", "asset": "ETH", "amount": 0.5 }
```

内置策略模板（`strategies/templates.py`）：
- `MeanReversionStrategy` — 价格偏离均值触发买卖
- `MomentumStrategy` — 追涨杀跌
- `DCAStrategy` — 定期定额买入

---

## 3. 前端

### 3.1 目录结构

```
frontend/src/
├── api/
│   ├── client.ts          # Axios 实例（baseURL = VITE_API_URL）
│   ├── strategies.ts      # 策略 API 函数
│   ├── matches.ts         # 比赛 API 函数
│   └── market.ts          # 行情 API 函数
├── components/
│   ├── common/            # Button / Loading / Toast
│   ├── layout/            # Header / Layout
│   ├── match/             # MatchCard / RunMatchForm
│   ├── strategy/          # StrategyCard / StrategyForm / StrategyList / StrategyStatsChart
│   ├── charts/            # 5 个 Recharts 图表组件
│   └── home/              # DashboardCharts
├── hooks/
│   ├── useStrategies.ts   # React Query hooks（CRUD）
│   ├── useMatches.ts      # React Query hooks（列表/详情/运行/删除）
│   └── useToast.ts        # 全局 Toast 状态（Zustand）
├── pages/
│   ├── Home.tsx           # 仪表盘
│   ├── Strategies.tsx     # 策略管理
│   ├── Matches.tsx        # 比赛列表
│   └── MatchDetail.tsx    # 比赛详情（含图表）
├── types/
│   ├── strategy.ts        # Strategy / StrategyCreate / StrategyType
│   └── match.ts           # Match / MatchConfig / MatchLogEntry / ExecutionEntry
├── utils/
│   └── cn.ts              # clsx + tailwind-merge 工具函数
└── index.css              # Tailwind 导入 + 全局组件类
```

### 3.2 路由与页面

| 路径 | 页面 | 说明 |
|---|---|---|
| `/` | `Home` | 统计卡片 + 活动趋势图 + 策略分布图 |
| `/strategies` | `Strategies` | 策略列表、创建/编辑/删除 |
| `/matches` | `Matches` | 比赛列表、发起新比赛 |
| `/matches/:id` | `MatchDetail` | 比赛详情：参数 + 排名 + 5 个图表 |

### 3.3 组件体系

#### 图表组件（`components/charts/`）

| 组件 | 数据来源 | 说明 |
|---|---|---|
| `PerformanceChart` | `logs + initialCapital` | 各策略收益率曲线（%） |
| `PortfolioValueChart` | `logs + initialCapital` | 各策略资金绝对值折线 |
| `ComparisonChart` | `participants` | 横向柱状图：收益率对比 |
| `TradeDistributionChart` | `participants` | 饼图：各策略交易次数占比 |
| `RadarComparisonChart` | `participants` | 雷达图：胜率/收益/稳定性多维比较 |

`PerformanceChart` 和 `PortfolioValueChart` 使用真实执行日志 (`MatchLogEntry[]`)，其余图表使用 `MatchParticipant[]` 汇总数据。

#### 关键 Props 类型

```typescript
// 需要 logs 的图表
interface PerformanceChartProps {
  participants: MatchParticipant[];
  steps: number;
  initialCapital: number;
  logs?: MatchLogEntry[];
}

// MatchDetail 获取方式
const { data: match } = useMatch(id, true); // include_logs=true
```

### 3.4 CSS Modules

项目采用 **CSS Modules + Tailwind v4 `@apply`** 方案：

- 每个组件目录下对应 `组件名.module.css`
- 图表组件共用 `components/charts/Chart.module.css`
- 每个 `.module.css` 文件顶部必须添加：
  ```css
  @reference "../../index.css";
  ```
- `@apply` 中**只能使用 Tailwind 内置工具类**，不能使用 `index.css` 中定义的自定义类（如 `card`、`text-gradient`）——需展开为原始工具类

**示例：**
```css
/* ✅ 正确 */
.container {
  @apply bg-black rounded-2xl border border-slate-800 p-6 md:p-8;
}

/* ❌ 错误（card 是自定义类） */
.container {
  @apply card;
}
```

### 3.5 数据获取

使用 **React Query v5** 管理所有服务端状态：

```typescript
// hooks/useStrategies.ts
export const useStrategies = () => useQuery({ queryKey: ['strategies'], queryFn: strategiesApi.list });
export const useCreateStrategy = () => useMutation({ mutationFn: strategiesApi.create, onSuccess: () => queryClient.invalidateQueries(['strategies']) });

// hooks/useMatches.ts
export const useMatch = (id: string, includeLogs = false) =>
  useQuery({ queryKey: ['match', id, includeLogs], queryFn: () => matchesApi.get(id, includeLogs) });
```

### 3.6 类型系统

核心类型定义（`types/match.ts`）：

```typescript
export interface ExecutionEntry {
  step: number;
  strategy_id: string;
  action: { type: string; asset?: string; amount?: number };
  portfolio: { cash: number; positions: Record<string, number>; total_value: number };
  price: number;
}

export interface MatchLogEntry {
  step: number;
  data: { logs: ExecutionEntry[] };
}

export interface Match {
  id: string;
  status: MatchStatus;
  config: MatchConfig;
  participants: MatchParticipant[];
  logs?: MatchLogEntry[];     // 仅在 include_logs=true 时存在
  created_at: string;
}
```

---

## 4. 数据流

以「运行一场比赛并查看结果」为例：

```
用户选择策略 → RunMatchForm
  → POST /api/matches/run
  → 后端 MatchEngine 执行（同步）
  → 每 10 步写 match_logs
  → 最终写 participants（排名/收益）
  → 返回 match 对象

页面跳转 MatchDetail
  → GET /api/matches/{id}?include_logs=true
  → React Query 缓存
  → 传递 participants 给 ComparisonChart / RadarChart / TradeDistributionChart
  → 传递 logs + initialCapital 给 PerformanceChart / PortfolioValueChart
```

---

## 5. 环境变量参考

### 后端（`backend/.env`）

```env
ENV=development
DEBUG=true
HOST=0.0.0.0
PORT=9000

DATABASE_URL=sqlite:///./data/agent_arena.db
# 生产环境示例：
# DATABASE_URL=postgresql://agent_arena:password@localhost:5432/agent_arena

SECRET_KEY=your-secret-key-change-in-production
CORS_ORIGINS=["http://localhost:3000"]

LOG_LEVEL=INFO
LOG_FILE=logs/app.log
```

### 前端（`frontend/.env`）

```env
VITE_API_URL=http://localhost:9000
```

> Vite proxy 已配置 `/api` → `http://localhost:9000`，本地开发可不设此变量。

---

## 6. 数据库迁移

项目使用 **Alembic** 管理数据库版本：

```bash
cd backend

# 生成迁移文件
alembic revision --autogenerate -m "描述变更"

# 执行迁移
alembic upgrade head

# 回滚一步
alembic downgrade -1
```

开发时若使用 SQLite，直接删除 `data/agent_arena.db` 重启服务即可重建表结构（`init_db()` 在 lifespan 中自动调用）。

---

## 7. 部署

### 开发环境

```bash
# 后端
cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 9000

# 前端
cd frontend && npm run dev
```

### 生产环境（Docker Compose）

```bash
# 构建并启动
docker compose -f docker-compose.prod.yml up -d --build

# 查看日志
docker compose -f docker-compose.prod.yml logs -f backend

# 停止
docker compose -f docker-compose.prod.yml down
```

**前端生产构建：**
```bash
cd frontend
npm run build        # 输出到 dist/
npm run preview      # 预览构建产物
```

---

## 8. 开发规范

### 后端

- 新增 API 路由在 `app/api/` 建文件，在 `main.py` 注册
- 数据库操作统一通过 `db/crud.py` 中的 CRUD 类，不在 API 层直接操作 ORM
- 所有配置通过 `settings` 对象读取，禁止硬编码
- 日志使用 `loguru.logger`

### 前端

- 新增页面在 `pages/` 创建，在 `App.tsx` 添加路由
- 组件拆分原则：超过 100 行或被多处复用则抽离为独立组件
- 服务端数据统一通过 `hooks/` 中的 React Query hook 获取，避免 `useEffect + fetch`
- 样式：组件级样式用 CSS Module，跨组件工具类用 `index.css` 的全局类，布局微调用内联 Tailwind
- `@apply` 中只使用 Tailwind 内置类（需要自定义类的地方展开写）
- 新增类型在 `types/` 对应文件中扩展，保持与后端 Pydantic 模型同步
