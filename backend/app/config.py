from pydantic_settings import BaseSettings
from pydantic import computed_field
from typing import Optional, List, Union
import json


def _parse_cors_origins(v: Union[str, List[str], None]) -> List[str]:
    """支持 JSON 数组或逗号分隔的 URL 字符串，便于在 Render 等平台配置"""
    if v is None or (isinstance(v, str) and not v.strip()):
        return ["http://localhost:3000", "http://localhost:5173"]
    if isinstance(v, list):
        return [str(x).strip() for x in v if str(x).strip()]
    s = v.strip()
    if s.startswith("["):
        try:
            out = json.loads(s)
            return [str(x).strip() for x in out if str(x).strip()]
        except json.JSONDecodeError:
            pass
    return [x.strip() for x in s.split(",") if x.strip()]


class Settings(BaseSettings):
    """应用配置"""

    # 基础配置
    env: str = "development"
    debug: bool = True

    # 服务配置
    host: str = "0.0.0.0"
    port: int = 9000

    # 数据库配置
    database_url: str = "sqlite:///./data/agent_arena.db"
    db_pool_size: int = 5
    db_max_overflow: int = 10
    db_pool_timeout: int = 30
    db_pool_recycle: int = 3600
    db_echo: bool = False

    # 日志配置
    log_level: str = "INFO"
    log_file: str = "logs/app.log"

    # 安全配置
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # CORS 配置：环境变量为字符串，支持 JSON 数组或逗号分隔的 URL，避免 Render 等平台 JSON 解析失败
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    @computed_field
    @property
    def cors_origins_list(self) -> List[str]:
        return _parse_cors_origins(self.cors_origins)

    # 对象存储（可选）
    use_object_storage: bool = False
    s3_bucket: Optional[str] = None
    s3_region: Optional[str] = None
    s3_access_key: Optional[str] = None
    s3_secret_key: Optional[str] = None

    # Redis（可选）
    redis_url: Optional[str] = "redis://localhost:6379/0"

    # 比赛配置
    max_strategies_per_match: int = 10
    max_match_duration_steps: int = 500
    default_initial_capital: float = 10000.0

    # 兼容旧配置
    initial_capital: float = 10000.0
    match_duration_minutes: int = 10

    # 交易配置
    fee_rate: float = 0.002  # 0.2%
    slippage_rate: float = 0.001  # 0.1%

    @computed_field
    @property
    def is_sqlite(self) -> bool:
        """判断是否使用 SQLite 数据库"""
        return self.database_url.startswith("sqlite")

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
