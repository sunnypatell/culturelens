"""session management endpoints."""

import uuid
from datetime import datetime

from fastapi import APIRouter, HTTPException

from app.models.session import (
    Session,
    SessionCreateRequest,
    SessionResponse,
    SessionStatus,
)

router = APIRouter()

# in-memory storage for MVP (replace with database later)
sessions_db: dict[str, Session] = {}


@router.post("/sessions", response_model=SessionResponse, status_code=201)
async def create_session(request: SessionCreateRequest):
    """created a new conversation session with consent and settings."""
    # generate unique session id
    session_id = str(uuid.uuid4())

    # validate dual consent
    if not (request.consent.person_a and request.consent.person_b):
        raise HTTPException(
            status_code=400,
            detail="both participants must consent before creating a session",
        )

    # created session object
    session = Session(
        id=session_id,
        created_at=datetime.utcnow(),
        consent=request.consent,
        settings=request.settings,
        status=SessionStatus.RECORDING,
    )

    # store in memory
    sessions_db[session_id] = session

    return SessionResponse(
        session=session,
        message=f"session {session_id} created successfully",
    )


@router.get("/sessions/{session_id}", response_model=Session)
async def get_session(session_id: str):
    """retrieved session by id."""
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail=f"session {session_id} not found")

    return sessions_db[session_id]


@router.get("/sessions", response_model=list[Session])
async def list_sessions():
    """listed all sessions (most recent first)."""
    sessions_list = list(sessions_db.values())
    sessions_list.sort(key=lambda s: s.created_at, reverse=True)
    return sessions_list


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    """deleted a session (for ephemeral mode)."""
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail=f"session {session_id} not found")

    del sessions_db[session_id]
    return {"message": f"session {session_id} deleted successfully"}
