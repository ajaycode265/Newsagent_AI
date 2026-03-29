from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel
from typing import Optional, List
import json
import uuid
from datetime import datetime
import os

from models.state import create_initial_state
from orchestrator import OrchestratorAgent
from agents import DeepBriefingAgent

app = FastAPI(title="MyET AI - News Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PipelineRequest(BaseModel):
    intent: str
    topic: str
    persona: Optional[str] = "cfo"

class FeedRequest(BaseModel):
    topic: str
    persona: str = "cfo"

class BriefingRequest(BaseModel):
    topic: str

class QuestionRequest(BaseModel):
    question: str
    session_id: str

class VideoRequest(BaseModel):
    article_id: Optional[str] = None
    topic: Optional[str] = "bankruptcy"

@app.get("/")
async def root():
    return {
        "message": "MyET AI - News Agent API",
        "version": "1.0.0",
        "endpoints": [
            "/api/pipeline/run",
            "/api/feed",
            "/api/briefing/generate",
            "/api/briefing/ask",
            "/api/video/generate",
            "/api/trace/{session_id}"
        ]
    }

@app.post("/api/pipeline/run")
async def run_pipeline(req: PipelineRequest):
    session_id = str(uuid.uuid4())
    
    async def stream():
        state = create_initial_state(req.topic, session_id, req.persona)
        orchestrator = OrchestratorAgent()
        
        try:
            async for step in orchestrator.run_streaming(req.intent, state):
                yield f"data: {json.dumps(step)}\n\n"
        except Exception as e:
            error_data = {
                "type": "error",
                "error": str(e)
            }
            yield f"data: {json.dumps(error_data)}\n\n"
    
    return StreamingResponse(stream(), media_type="text/event-stream")

@app.post("/api/feed")
async def get_feed(req: FeedRequest):
    from agents import NewsIngestionAgent, ProcessingAgent, UserProfileAgent, PersonalisedFeedAgent
    
    try:
        ingestion = NewsIngestionAgent()
        articles, _ = ingestion.fetch_articles(req.topic, use_tavily=False)
        normalized = ingestion.normalize_articles(articles)
        
        processing = ProcessingAgent()
        processed, _ = processing.process_articles(normalized)
        
        profile = UserProfileAgent()
        scored, _ = profile.score_articles_for_persona(processed, req.persona)
        
        feed_agent = PersonalisedFeedAgent()
        feed, metadata = feed_agent.create_personalised_feed(scored, req.persona)
        
        return {
            "success": True,
            "persona": req.persona,
            "feed": feed,
            "metadata": metadata
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/briefing/generate")
async def generate_briefing(req: BriefingRequest):
    from agents import NewsIngestionAgent, ProcessingAgent, DeepBriefingAgent
    
    try:
        session_id = str(uuid.uuid4())
        
        ingestion = NewsIngestionAgent()
        articles, _ = ingestion.fetch_articles(req.topic, use_tavily=False)
        normalized = ingestion.normalize_articles(articles)
        
        processing = ProcessingAgent()
        processed, _ = processing.process_articles(normalized)
        
        briefing_agent = DeepBriefingAgent()
        briefing, metadata = briefing_agent.create_briefing(processed, req.topic, session_id)
        
        return {
            "success": True,
            "briefing": briefing,
            "metadata": metadata,
            "session_id": session_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/briefing/ask")
async def ask_question(req: QuestionRequest):
    try:
        briefing_agent = DeepBriefingAgent()
        answer = briefing_agent.answer_question(req.question, req.session_id)
        
        return {
            "success": True,
            "question": req.question,
            **answer
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/video/generate")
async def generate_video(req: VideoRequest):
    from agents import NewsIngestionAgent, VernacularVideoAgent
    
    try:
        session_id = str(uuid.uuid4())
        
        ingestion = NewsIngestionAgent()
        articles, _ = ingestion.fetch_articles(req.topic, use_tavily=False)
        
        if not articles:
            raise HTTPException(status_code=404, detail="No articles found")
        
        article = articles[0]
        
        video_agent = VernacularVideoAgent()
        video_data, trace_steps = video_agent.create_video(article, session_id)
        
        return {
            "success": True,
            "job_id": session_id,
            "video_data": video_data,
            "trace": trace_steps
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/video/status/{job_id}")
async def get_video_status(job_id: str):
    video_path = f"backend/videos/{job_id}_video.mp4"
    
    if os.path.exists(video_path):
        return {
            "status": "completed",
            "video_url": f"/api/video/download/{job_id}",
            "progress_steps": []
        }
    else:
        return {
            "status": "processing",
            "video_url": None,
            "progress_steps": []
        }

@app.get("/api/video/download/{job_id}")
async def download_video(job_id: str):
    video_path = f"backend/videos/{job_id}_video.mp4"
    
    if os.path.exists(video_path):
        return FileResponse(video_path, media_type="video/mp4", filename=f"{job_id}.mp4")
    else:
        raise HTTPException(status_code=404, detail="Video not found")

@app.get("/api/trace/{session_id}")
async def get_trace(session_id: str):
    return {
        "session_id": session_id,
        "steps": [],
        "token_usage": {},
        "total_time_ms": 0
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
