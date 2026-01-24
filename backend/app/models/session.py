"""session data models matching frontend TypeScript types."""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class ConsentStatus(BaseModel):
    """consent status for both participants."""

    model_config = ConfigDict(populate_by_name=True)

    person_a: bool = Field(default=False, alias="personA")
    person_b: bool = Field(default=False, alias="personB")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class StorageMode(str, Enum):
    """storage mode options."""

    EPHEMERAL = "ephemeral"
    TRANSCRIPT_ONLY = "transcriptOnly"
    FULL = "full"


class SessionSettings(BaseModel):
    """session configuration settings."""

    model_config = ConfigDict(populate_by_name=True)

    storage_mode: StorageMode = Field(default=StorageMode.EPHEMERAL, alias="storageMode")
    voice_id: str = Field(default="", alias="voiceId")
    comm_tags: list[str] = Field(default_factory=list, alias="commTags")


class SessionStatus(str, Enum):
    """session processing status."""

    RECORDING = "recording"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"


class Session(BaseModel):
    """main session object."""

    model_config = ConfigDict(populate_by_name=True)

    id: str
    created_at: datetime = Field(default_factory=datetime.utcnow, alias="createdAt")
    consent: ConsentStatus
    settings: SessionSettings
    status: SessionStatus = SessionStatus.RECORDING


class SessionCreateRequest(BaseModel):
    """request body for creating a new session."""

    consent: ConsentStatus
    settings: SessionSettings


class SessionResponse(BaseModel):
    """response for session operations."""

    session: Session
    message: str = "session created successfully"
