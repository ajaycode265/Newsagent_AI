# NewsAgent AI — Multi-Agent News Intelligence Platform

> **ET AI Hackathon 2026 · Track 8**  
> Transforming static business news into intelligent, personalized, interactive experiences using a 6-agent autonomous pipeline.

---

## What It Does

NewsAgent AI takes a raw news topic and runs it through a fully autonomous multi-agent pipeline — ingesting articles, extracting entities, detecting sentiment, scoring importance, personalizing per user persona, generating deep briefings, and producing Hindi video explanations — all in under 60 seconds.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER (Browser)                               │
│              Next.js 14 Frontend · http://localhost:3000            │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│   │  Home    │ │  /feed   │ │/briefing │ │  /video  │ │/trace  │  │
│   └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘  │
└────────┼────────────┼────────────┼─────────────┼───────────┼───────┘
         │            │            │             │           │
         └────────────┴────────────┴─────────────┴───────────┘
                                   │ HTTP / REST
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│               FastAPI Backend · http://localhost:8000               │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   OrchestratorAgent (ReAct Loop)             │   │
│  │  Decides next tool to call based on current pipeline state   │   │
│  └───────────────────────┬─────────────────────────────────────┘   │
│                           │  dispatches to                         │
│      ┌────────────────────┼────────────────────┐                   │
│      ▼                    ▼                    ▼                   │
│  ┌───────────┐     ┌─────────────┐     ┌──────────────┐           │
│  │  Agent 1  │     │  Agent 2    │     │   Agent 3    │           │
│  │ News      │────▶│ Processing  │────▶│ UserProfile  │           │
│  │ Ingestion │     │ Agent       │     │ Agent        │           │
│  │           │     │             │     │              │           │
│  │• Tavily   │     │• Entity     │     │• CFO scoring │           │
│  │  API      │     │  Extraction │     │• First-Gen   │           │
│  │• Mock JSON│     │• Sentiment  │     │  scoring     │           │
│  │• ChromaDB │     │• Importance │     │              │           │
│  │  dedup    │     │  Scoring    │     │              │           │
│  └───────────┘     └─────────────┘     └──────┬───────┘           │
│                                               │                    │
│      ┌────────────────────┬──────────────────┘                    │
│      ▼                    ▼                                        │
│  ┌───────────┐     ┌─────────────┐     ┌──────────────────────┐   │
│  │  Agent 4  │     │  Agent 5    │     │      Agent 6         │   │
│  │Personalised│    │ Deep        │     │  VernacularVideo     │   │
│  │Feed Agent │     │ Briefing    │     │  Agent               │   │
│  │           │     │ Agent       │     │                      │   │
│  │• Headline │     │• 7-section  │     │• Hinglish script     │   │
│  │  rewrite  │     │  synthesis  │     │• Hindi translation   │   │
│  │• Top-12   │     │• Q&A routing│     │• gTTS audio          │   │
│  │  ranking  │     │  (ChromaDB) │     │• MoviePy MP4 video   │   │
│  └───────────┘     └─────────────┘     └──────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    LLM Router (LiteLLM)                       │  │
│  │  synthesis → groq/llama-3.3-70b-versatile                    │  │
│  │  extraction → groq/llama-3.1-8b-instant                      │  │
│  │  translation → groq/llama-3.1-8b-instant                     │  │
│  │  creative → groq/llama-3.3-70b-versatile                     │  │
│  │  fast → groq/llama-3.1-8b-instant                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────┐   ┌─────────────┐   ┌──────────────────────────┐  │
│  │  ChromaDB   │   │  Mock Data  │   │  Videos Output           │  │
│  │  (vector DB)│   │  (3 JSON    │   │  backend/videos/*.mp4    │  │
│  │  dedup +    │   │  datasets)  │   │                          │  │
│  │  Q&A search │   │             │   │                          │  │
│  └─────────────┘   └─────────────┘   └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6-Agent Pipeline

| # | Agent | Responsibility | LLM Tier |
|---|-------|---------------|----------|
| 1 | **NewsIngestionAgent** | Fetch articles from Tavily or mock JSON, deduplicate via ChromaDB cosine similarity | None |
| 2 | **ProcessingAgent** | Entity extraction (companies, people, sectors), sentiment detection, importance scoring | extraction, fast |
| 3 | **UserProfileAgent** | Score each article for CFO and First-Gen Investor relevance based on keyword and sector matching | None (pure Python) |
| 4 | **PersonalisedFeedAgent** | Rank top-12 articles per persona, rewrite headlines in persona tone | fast |
| 5 | **DeepBriefingAgent** | Synthesize 22 articles into 7 non-overlapping sections, answer Q&A with ChromaDB attribution | synthesis |
| 6 | **VernacularVideoAgent** | Simplify to Hinglish → translate to Hindi Devanagari → gTTS audio → MoviePy MP4 | creative, translation |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React |
| **Backend** | Python 3.9+, FastAPI, Uvicorn |
| **Orchestration** | Custom ReAct loop (`orchestrator/react_loop.py`) |
| **LLM Routing** | LiteLLM (Groq via `litellm`) |
| **Active LLMs** | `groq/llama-3.3-70b-versatile`, `groq/llama-3.1-8b-instant` |
| **Vector DB** | ChromaDB (cosine similarity for dedup + semantic Q&A) |
| **TTS** | gTTS (Google Text-to-Speech, Hindi) |
| **Video** | MoviePy + Pillow (MP4 assembly with subtitles) |
| **News API** | Tavily (with mock JSON fallback) |

---

## Pages & Features

### 🏠 Home (`/`)
Landing page with demo entry points. Links to all three demo flows.

### 📰 Persona Comparison (`/feed`)
- Loads 22 Union Budget articles through the full pipeline
- Side-by-side: **CFO Perspective** (technical, data-driven) vs **First-Gen Investor** (simple, actionable)
- Headlines are rewritten by Groq LLM per persona tone
- Generic feed strip shows top articles ranked by importance score

### 📄 Deep Briefing (`/briefing?topic=union+budget+2026`)
- Synthesizes 22 articles into **7 non-overlapping sections**
- Sticky sidebar navigation between sections
- **Q&A interface** at the bottom — ask any question, get an answer with source section attribution powered by ChromaDB semantic search

### 🎥 Hindi Video (`/video?topic=bankruptcy`)
- 8 quick-pick topics + custom topic search bar
- **Two generation modes:**
  - **Generate Hindi Video** — full 6-step pipeline (Hinglish → Hindi → TTS → subtitles → MP4). Animated progress bar shows phase name + percentage (10%→100%). Video player appears in the right column on completion.
  - **🎧 Audio Summary** (faster, ~15s) — fetches news, generates Hinglish + Hindi scripts, produces MP3 via gTTS. Audio player autoplays with both scripts displayed.
- Progress bars turn green at 100% for both modes

### 🔍 Agent Trace (`/trace`)
- Complete audit trail of all 7 agent steps
- Color-coded by agent type
- Expandable metadata per step (models used, article counts, timing)
- Export as JSON

---

## Project Structure

```
ET_GEN_AI/
├── backend/
│   ├── agents/
│   │   ├── ingestion.py          # Tavily/mock fetch + ChromaDB dedup
│   │   ├── processing.py         # Entity extraction, sentiment, importance
│   │   ├── user_profile.py       # CFO / First-Gen persona scoring
│   │   ├── personalised_feed.py  # Feed ranking + headline rewriting
│   │   ├── deep_briefing.py      # Multi-article synthesis + Q&A
│   │   └── vernacular_video.py   # Hinglish → Hindi → TTS → MP4
│   ├── llm/
│   │   └── router.py             # LiteLLM multi-tier router (Groq)
│   ├── orchestrator/
│   │   └── react_loop.py         # ReAct autonomous orchestration loop
│   ├── models/
│   │   └── state.py              # NewsState TypedDict + helpers
│   ├── data/
│   │   ├── budget_articles.json  # 22 Union Budget 2026 articles
│   │   ├── feed_articles.json    # Generic feed articles
│   │   └── bankruptcy_article.json # Single article for video demo
│   ├── main.py                   # FastAPI app + all API endpoints
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Homepage
│   │   ├── feed/page.tsx         # Persona comparison
│   │   ├── briefing/page.tsx     # Deep briefing + Q&A
│   │   ├── video/page.tsx        # Hindi video generator
│   │   ├── trace/page.tsx        # Agent trace viewer
│   │   ├── components/
│   │   │   └── ArticleCard.tsx   # Reusable article card
│   │   ├── globals.css           # Design system (CSS variables)
│   │   └── layout.tsx
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
├── .env.example
├── SETUP.md
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/pipeline/run` | SSE stream — full autonomous pipeline run |
| `POST` | `/api/feed` | Personalized feed for a given topic + persona |
| `POST` | `/api/briefing/generate` | Generate 7-section deep briefing |
| `POST` | `/api/briefing/ask` | Q&A with ChromaDB source attribution |
| `POST` | `/api/video/generate` | Full Hindi video generation pipeline |
| `GET`  | `/api/video/status/{id}` | Poll video generation progress |
| `GET`  | `/api/trace/{session}` | Full agent trace for a session |
| `GET`  | `/api/health` | Backend health check |

---

## Demo Data

Three pre-loaded mock datasets (no Tavily key required):

| Dataset | Topic | Articles | Used In |
|---------|-------|----------|---------|
| `budget_articles.json` | Union Budget 2026 | 22 | Feed, Briefing |
| `bankruptcy_article.json` | Videocon Bankruptcy (NCLT) | 1 | Hindi Video |
| `feed_articles.json` | General Business News | 1 | Fallback |

---

## ⚠️ Known Rate Limit Constraints

This project uses **Groq Free Tier** which enforces token-per-minute limits. Some features may be slower or partially degraded in a live demo due to these limits:

| Feature | Status | Notes |
|---------|--------|-------|
| Feed Persona Comparison | ✅ Works | May hit rate limit on headline rewriting (22 articles × LLM calls). Fallback: original headlines shown |
| Deep Briefing Generation | ✅ Works | 7 synthesis calls — may take 15–30s |
| Briefing Q&A | ✅ Works | Single LLM call, fast |
| Hindi Video — Scripts | ✅ Works | 2 LLM calls (Hinglish + Hindi translation) |
| Hindi Video — Audio Summary | ✅ Works | Fast path — no video assembly needed (~15s) |
| Hindi Video — MP4 Assembly | ⚠️ Requires Setup | Needs `ffmpeg` + `moviepy` installed locally |
| Live News (Tavily) | ⚠️ Optional | Falls back to mock data if `TAVILY_API_KEY` not set |

**Rate limit fix**: If you hit `RateLimitError`, wait 30–60 seconds and retry. The pipeline has fallback methods for all LLM calls so it never fully breaks.

---

## Quick Start

```bash
# Backend
cd backend
pip install -r requirements.txt
# Add GROQ_API_KEY and TAVILY_API_KEY to .env (see SETUP.md)
uvicorn main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Then open **http://localhost:3000**

See [SETUP.md](./SETUP.md) for full setup instructions.

---

## License

MIT
