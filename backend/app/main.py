import sys
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from loguru import logger

from app.config import settings
from app.database import init_db
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

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    logger.info("🚀 Agent Arena 服务启动成功")
    logger.info(f"📝 API 文档: http://{settings.host}:{settings.port}/docs")
    yield
    logger.info("👋 服务关闭")


# 创建应用
app = FastAPI(
    title="Agent Arena API",
    description="AI 策略竞技场后端服务",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# 请求 ID 中间件（便于日志与错误响应关联）
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request.state.request_id = str(uuid.uuid4())[:8]
    return await call_next(request)


# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局异常处理
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_request: Request, exc: RequestValidationError):
    """请求体验证失败：返回 422 与字段级错误，便于前端展示"""
    errors = exc.errors()
    return JSONResponse(
        status_code=422,
        content={
            "detail": "请求参数校验失败",
            "errors": errors,
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """未捕获异常：记录日志并返回统一错误格式，不暴露堆栈"""
    request_id = getattr(request.state, "request_id", str(uuid.uuid4())[:8])
    logger.error(
        f"request_id={request_id} path={request.url.path} error={exc!r}",
        exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={
            "detail": "服务器内部错误，请稍后重试",
            "request_id": request_id,
        },
    )


# 注册路由
app.include_router(strategies.router, prefix="/api/strategies", tags=["strategies"])
app.include_router(matches.router, prefix="/api/matches", tags=["matches"])
app.include_router(market.router, prefix="/api/market", tags=["market"])

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
