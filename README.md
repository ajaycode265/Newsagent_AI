# MyET AI - AI Native News Experience

**ET AI Hackathon 2026 - Track 8**

A production-ready multi-agent AI news platform that transforms static business news into intelligent, personalized, interactive briefing experiences.

## Features

- **Multi-Article Synthesis**: Combines 5-15 articles into coherent briefings
- **Persona-Based Personalization**: CFO vs First-Gen Investor perspectives
- **Vernacular Translation**: Hindi explanations with video generation
- **Visible Agent Pipeline**: Full trace of all agent actions
- **Q&A Routing**: ChromaDB-powered semantic search across briefing sections

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind + shadcn/ui
- **Backend**: Python FastAPI
- **Agents**: LangGraph (stateful orchestration)
- **LLM**: LiteLLM (multi-provider routing)
- **Vector DB**: ChromaDB (deduplication + Q&A)
- **Database**: SQLite
- **TTS**: gTTS → ElevenLabs fallback
- **Video**: MoviePy

## Project Structure

```
ET_GEN_AI/
├── backend/
│   ├── agents/
│   │   ├── ingestion.py
│   │   ├── processing.py
│   │   ├── user_profile.py
│   │   ├── personalised_feed.py
│   │   ├── deep_briefing.py
│   │   └── vernacular_video.py
│   ├── llm/
│   │   └── router.py
│   ├── orchestrator/
│   │   └── react_loop.py
│   ├── models/
│   │   └── state.py
│   ├── data/
│   │   ├── budget_articles.json
│   │   ├── feed_articles.json
│   │   └── bankruptcy_article.json
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── feed/
│   │   ├── briefing/
│   │   ├── video/
│   │   └── trace/
│   ├── components/
│   └── package.json
├── .env.example
└── README.md
```

## Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
```

Create `.env` file:
```env
LLM_SYNTHESIS=gpt-4o
LLM_EXTRACTION=gpt-4o-mini
LLM_TRANSLATION=gpt-4o-mini
LLM_CREATIVE=gpt-4o
LLM_FAST=groq/llama3-8b-8192

OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
GROQ_API_KEY=your_key
TAVILY_API_KEY=your_key
```

Run backend:
```bash
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Demo Scenarios

### Demo 1: Union Budget Briefing
- Combines 22 budget articles
- 7 non-overlapping sections
- Q&A with source section attribution

### Demo 2: Persona Comparison
- Same news, different perspectives
- CFO: Technical, macro-focused
- First-Gen Investor: Simple, actionable

### Demo 3: Hindi Video
- Bankruptcy article → Hindi explanation
- 5-step pipeline (< 60s)
- MP4 with subtitles

## API Endpoints

- `POST /api/pipeline/run` - SSE stream of agent pipeline
- `POST /api/feed` - Get personalized feed
- `POST /api/briefing/generate` - Create structured briefing
- `POST /api/briefing/ask` - Q&A with source attribution
- `POST /api/video/generate` - Async video generation
- `GET /api/video/status/:id` - Check video progress
- `GET /api/trace/:session` - Full agent trace

## Agent Pipeline

1. **NewsIngestionAgent**: Fetch & deduplicate articles
2. **ProcessingAgent**: Extract entities, sentiment, importance
3. **UserProfileAgent**: Score for CFO/First-Gen personas
4. **PersonalisedFeedAgent**: Rewrite headlines per persona
5. **DeepBriefingAgent**: Synthesize multi-article briefings
6. **VernacularVideoAgent**: Generate Hindi video explanations

## License

MIT
