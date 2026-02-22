from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import sys
from pathlib import Path

from app.config import settings
from app.api import strategies, matches, market

# 配置日志
logger.remove()
logger.add(
    sys.stdout,
    colorize=True,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>"
)
logger.add(
    settings.log_file,
    rotation="500 MB",
    retention="10 days",
    compression="zip"
)

# 创建应用
app = FastAPI(
    title="Agent Arena API",
    description="AI 策略竞技场后端服务",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(strategies.router, prefix="/api/strategies", tags=["strategies"])
app.include_router(matches.router, prefix="/api/matches", tags=["matches"])
app.include_router(market.router, prefix="/api/market", tags=["market"])

@app.on_event("startup")
async def startup():
    logger.info("🚀 Agent Arena 服务启动成功")
    logger.info(f"📝 API 文档: http://{settings.host}:{settings.port}/docs")

@app.on_event("shutdown")
async def shutdown():
    logger.info("👋 服务关闭")

@app.get("/")
async def root():
    return {
        "message": "Agent Arena API",
        "version": "0.1.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    return {"status": "ok"}
