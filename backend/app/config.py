from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """应用配置"""

    # 基础配置
    env: str = "development"
    debug: bool = True

    # 服务配置
    host: str = "0.0.0.0"
    port: int = 8000

    # 日志配置
    log_level: str = "DEBUG"
    log_file: str = "logs/app.log"

    # 比赛配置
    initial_capital: float = 10000.0
    max_strategies_per_match: int = 10
    match_duration_minutes: int = 10

    # 交易配置
    fee_rate: float = 0.002  # 0.2%
    slippage_rate: float = 0.001  # 0.1%

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
