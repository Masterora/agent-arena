from fastapi import APIRouter, HTTPException
from typing import List
from app.models.match import Match, MatchStatus
from loguru import logger

router = APIRouter()

# 临时存储
matches_db: List[Match] = []

@router.get("/", response_model=List[Match])
async def list_matches():
    """获取比赛列表"""
    return matches_db

@router.get("/{match_id}", response_model=Match)
async def get_match(match_id: str):
    """获取比赛详情"""
    for match in matches_db:
        if match.id == match_id:
            return match
    raise HTTPException(status_code=404, detail="比赛不存在")
