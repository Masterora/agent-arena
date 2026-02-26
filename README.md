# Agent Arena

> AI 策略竞技场 —— 让你的交易策略在真实/模拟行情中相互对决

## 项目简介

Agent Arena 是一个全栈交易策略对抗平台。用户可以创建参数化策略，并将多个策略放入同一场比赛，在模拟或真实加密行情中实时执行，最终按收益率排名产生胜者。

**核心功能：**

- 📝 **策略管理** — 创建、编辑、删除均值回归 / 动量追踪 / 定投策略，支持止损/止盈/最大持仓等风控参数
- ⚔️ **策略对决** — 最多 10 个策略同场竞技，支持模拟行情与 CoinGecko 历史 / 实时数据
- 📊 **结果分析** — 收益曲线、资金折线、雷达图、交易分布等多维可视化
- 🏆 **排行榜** — 比赛结束后自动计算排名、胜率、平均收益、最大回撤、夏普率

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 19 · TypeScript 5.9 · Vite 7 · Tailwind CSS v4 · Recharts · React Query v5 · React Router v7 |
| 后端 | Python · FastAPI · SQLAlchemy 2 · Alembic · Pydantic v2 · loguru |
| 数据库 | SQLite（开发）· PostgreSQL 16（生产） |
| 行情数据 | 内置模拟生成器 · CoinGecko 免费 API |
| 容器化 | Docker Compose |

## 快速开始

### 方式一：本地开发（推荐）

**1. 克隆项目**
```bash
git clone <repo-url>
cd agent-arena
```

**2. 后端**
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 127.0.0.1 --port 9000
```

**3. 前端**（新建终端）
```bash
cd frontend
npm install
npm run dev
```

打开浏览器访问 **http://localhost:3000**，API 文档见 **http://localhost:9000/docs**

---

### 方式二：Docker Compose（含 PostgreSQL）

```bash
cp backend/.env.example backend/.env   # 按需修改
docker compose up -d
```

## 项目结构

```
agent-arena/
├── backend/
│   ├── app/
│   │   ├── api/              # FastAPI 路由（strategies / matches / market）
│   │   ├── core/             # 比赛引擎 & 行情数据生成器
│   │   ├── db/               # SQLAlchemy 模型 & CRUD
│   │   ├── models/           # Pydantic 响应模型
│   │   ├── strategies/       # 内置策略模板
│   │   ├── config.py         # pydantic-settings 配置
│   │   ├── database.py       # 数据库连接
│   │   └── main.py           # FastAPI 应用入口
│   ├── alembic/              # 数据库迁移
│   ├── data/                 # SQLite 数据文件（开发）
│   ├── logs/                 # 运行日志
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios 请求封装
│   │   ├── components/       # 可复用组件（含 CSS Modules）
│   │   ├── hooks/            # React Query 自定义 Hooks
│   │   ├── pages/            # 页面组件
│   │   ├── types/            # TypeScript 类型定义
│   │   └── utils/            # 工具函数
│   └── package.json
├── docker-compose.yml         # 开发/测试环境
├── docker-compose.prod.yml    # 生产环境
└── docs/
    └── development.md         # 开发者文档
```

## 环境变量

参考 `backend/.env.example` 和 `frontend/.env.example`，关键配置项：

| 变量 | 默认值 | 说明 |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./data/agent_arena.db` | 数据库连接串 |
| `SECRET_KEY` | `dev-secret-key-...` | JWT 密鑰（生产必改） |
| `CORS_ORIGINS` | `["http://localhost:3000"]` | 允许的前端地址 |
| `PORT` | `9000` | 后端监听端口 |
| `VITE_API_URL` | `http://localhost:9000` | 前端 API 基础地址 |

## 开发文档

详细的架构说明、API 参考、组件设计请参阅 [docs/development.md](docs/development.md)。

## License

MIT
