from typing import TypedDict, Optional, List, Dict, Any
from datetime import datetime

class NewsState(TypedDict):
    topic: str
    raw_articles: List[Dict[str, Any]]
    processed_articles: List[Dict[str, Any]]
    user_profile: Dict[str, Any]
    personalised_feed: List[Dict[str, Any]]
    briefing: Dict[str, Any]
    video_script_en: str
    video_script_hi: str
    video_path: Optional[str]
    session_id: str
    step_trace: List[Dict[str, Any]]
    engagement_signals: List[Dict[str, Any]]
    error_log: List[Dict[str, Any]]
    token_usage: Dict[str, int]

def create_initial_state(topic: str, session_id: str, persona: str = "cfo") -> NewsState:
    return {
        "topic": topic,
        "raw_articles": [],
        "processed_articles": [],
        "user_profile": {"persona": persona},
        "personalised_feed": [],
        "briefing": {},
        "video_script_en": "",
        "video_script_hi": "",
        "video_path": None,
        "session_id": session_id,
        "step_trace": [],
        "engagement_signals": [],
        "error_log": [],
        "token_usage": {"total": 0, "synthesis": 0, "extraction": 0, "translation": 0, "creative": 0, "fast": 0}
    }

def add_trace_step(state: NewsState, step: str, agent: str, status: str, time_ms: int, metadata: Dict = None) -> None:
    trace_entry = {
        "step": step,
        "agent": agent,
        "status": status,
        "time_ms": time_ms,
        "timestamp": datetime.now().isoformat(),
        "metadata": metadata or {}
    }
    state["step_trace"].append(trace_entry)

def add_error(state: NewsState, error: str, agent: str) -> None:
    error_entry = {
        "error": error,
        "agent": agent,
        "timestamp": datetime.now().isoformat()
    }
    state["error_log"].append(error_entry)
