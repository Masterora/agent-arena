-- 用户表
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 策略表
CREATE TABLE strategies (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,  -- mean_reversion, momentum, dca, custom
    params JSON NOT NULL,
    code TEXT,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,

    -- 统计数据
    total_matches INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    win_rate FLOAT DEFAULT 0.0,
    avg_return FLOAT DEFAULT 0.0,
    total_return FLOAT DEFAULT 0.0,
    sharpe_ratio FLOAT DEFAULT 0.0,
    max_drawdown FLOAT DEFAULT 0.0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_public (is_public)
);

-- 比赛表
CREATE TABLE matches (
    id VARCHAR(36) PRIMARY KEY,
    creator_id VARCHAR(36) REFERENCES users(id),
    status VARCHAR(20) NOT NULL,  -- pending, betting, running, completed, failed

    -- 配置
    initial_capital FLOAT NOT NULL,
    trading_pair VARCHAR(20) NOT NULL,
    timeframe VARCHAR(10) NOT NULL,
    duration_steps INTEGER NOT NULL,
    market_type VARCHAR(20),  -- random, trending, ranging, historical

    -- 时间
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_status (status),
    INDEX idx_creator (creator_id),
    INDEX idx_created (created_at)
);

-- 比赛参与表（多对多）
CREATE TABLE match_participants (
    id VARCHAR(36) PRIMARY KEY,
    match_id VARCHAR(36) REFERENCES matches(id) ON DELETE CASCADE,
    strategy_id VARCHAR(36) REFERENCES strategies(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(id),

    -- 结果
    final_value FLOAT,
    return_pct FLOAT,
    total_trades INTEGER DEFAULT 0,
    win_trades INTEGER DEFAULT 0,
    rank INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(match_id, strategy_id),
    INDEX idx_match (match_id),
    INDEX idx_strategy (strategy_id)
);

-- 比赛执行日志（可选，大数据量可以存 JSON 文件或对象存储）
CREATE TABLE match_logs (
    id VARCHAR(36) PRIMARY KEY,
    match_id VARCHAR(36) REFERENCES matches(id) ON DELETE CASCADE,
    step INTEGER NOT NULL,
    data JSON NOT NULL,  -- 包含所有策略的执行数据
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_match_step (match_id, step)
);

-- 市场数据表（历史数据回测用）
CREATE TABLE market_data (
    id VARCHAR(36) PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    timeframe VARCHAR(10) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    open FLOAT NOT NULL,
    high FLOAT NOT NULL,
    low FLOAT NOT NULL,
    close FLOAT NOT NULL,
    volume FLOAT NOT NULL,

    UNIQUE(symbol, timeframe, timestamp),
    INDEX idx_symbol_time (symbol, timeframe, timestamp)
);

-- 投注表（未来功能）
CREATE TABLE bets (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id),
    match_id VARCHAR(36) REFERENCES matches(id),
    strategy_id VARCHAR(36) REFERENCES strategies(id),
    amount FLOAT NOT NULL,
    odds FLOAT NOT NULL,
    status VARCHAR(20) NOT NULL,  -- pending, won, lost, cancelled
    payout FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user (user_id),
    INDEX idx_match (match_id)
);
