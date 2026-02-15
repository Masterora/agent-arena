# Agent Arena

> AI 策略竞技场 - 智能体驱动的加密原生应用

## 项目简介

Agent Arena 是一个基于智能体对抗的 DeFi 策略竞技平台。用户可以：
- 编写或配置交易策略
- 积累链上可验证的策略信誉

## 技术栈

- **后端**: Python 3.14 + FastAPI
- **数据处理**: Pandas + NumPy
- **区块链**: Base L2 (Solidity)
- **前端**: React + TypeScript (待开发)

## 快速开始

### 1. 安装依赖

```bash
.\venv\Scripts\Activate.ps1
cd backend
pip install -r requirements.txt
```

### 2. 启动服务

```bash
uvicorn app.main:app --reload
```

### 3. 访问 API 文档

打开浏览器访问: http://localhost:8000/docs

## 项目结构

```
agent-arena/
├── backend/          # 后端服务
├── frontend/         # 前端应用 (待开发)
├── data/             # 数据存储
└── docs/             # 项目文档
```

## 开发进度

- [x] 项目框架搭建
- [x] 策略执行引擎
- [ ] 行情数据接入
- [ ] 前端界面开发

## License

MIT
