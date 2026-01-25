"""health check endpoints."""

import logging
from datetime import datetime

from fastapi import APIRouter

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/health")
async def health_check():
    """health check endpoint to verify backend is running."""
    logger.info("💚 Health check requested")
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "culturelens-backend",
        "version": "0.1.0",
    }


@router.get("/health/ready")
async def readiness_check():
    """readiness check for deployment health checks."""
    logger.info("🟢 Readiness check requested")
    return {
        "status": "ready",
        "timestamp": datetime.utcnow().isoformat(),
    }
