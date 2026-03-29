# NewsAgent AI — Setup Guide

Complete setup instructions for running the NewsAgent AI multi-agent news intelligence platform locally.

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Python | 3.9+ | 3.11 recommended |
| Node.js | 18+ | For the Next.js frontend |
| npm | 8+ | Comes with Node.js |
| ffmpeg | Any | Required for MP4 video assembly only |
| Git | Any | To clone the repo |

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/ajaycode265/Newsagent_AI.git
cd Newsagent_AI
```

---

## Step 2 — Backend Setup

### 2a. Create and activate a virtual environment (recommended)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python -m venv venv
source venv/bin/activate
```

### 2b. Install Python dependencies

```bash
cd backend
pip install -r requirements.txt
```

> This installs FastAPI, LiteLLM, ChromaDB, gTTS, MoviePy, Pillow, python-dotenv, and all other dependencies.

### 2c. Create the `.env` file

Copy the example and fill in your API keys:

```bash
# From the root folder
cp .env.example .env
```

Edit `.env` and fill in the following:

```env
# ─── LLM Models (pre-configured for Groq — do not change) ───────────────────
LLM_SYNTHESIS=groq/llama-3.3-70b-versatile
LLM_EXTRACTION=groq/llama-3.1-8b-instant
LLM_TRANSLATION=groq/llama-3.1-8b-instant
LLM_CREATIVE=groq/llama-3.3-70b-versatile
LLM_FAST=groq/llama-3.1-8b-instant

# ─── Required ────────────────────────────────────────────────────────────────
GROQ_API_KEY=your_groq_api_key_here
# Get free key at: https://console.groq.com

# ─── Optional: Live News Fetching ────────────────────────────────────────────
TAVILY_API_KEY=your_tavily_key_here
# Get free key at: https://app.tavily.com
# Without this, the system uses built-in mock data (works fine for demos)

# ─── Optional: Other LLM Providers ──────────────────────────────────────────
GOOGLE_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# ─── Optional: ElevenLabs TTS (premium voice) ────────────────────────────────
ELEVENLABS_API_KEY=
# Without this, gTTS (free Google TTS) is used for Hindi audio
```

### 2d. Start the backend server

```bash
# From the backend/ directory
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

Verify it's working:
```bash
curl http://127.0.0.1:8000/api/health
# Expected: {"status": "ok"}
```

---

## Step 3 — Frontend Setup

Open a **new terminal** (keep the backend running).

```bash
cd frontend
npm install
npm run dev
```

You should see:
```
▲ Next.js 14.x.x
- Local:   http://localhost:3000
```

---

## Step 4 — Open the App

Navigate to **http://localhost:3000** in your browser.

You should see the NewsAgent AI homepage with three demo entry points.

---

## Step 5 — Install ffmpeg (for Hindi Video MP4)

The Hindi video feature requires `ffmpeg` for audio/video assembly. Without it, the LLM scripts and audio will still generate, but the final MP4 won't be created.

### Windows
```bash
# Using Chocolatey (recommended)
choco install ffmpeg

# Or download manually from https://ffmpeg.org/download.html
# and add to PATH
```

### macOS
```bash
brew install ffmpeg
```

### Linux
```bash
sudo apt-get install ffmpeg
```

Verify installation:
```bash
ffmpeg -version
```

---

## Running the Demos

### Demo 1 — Deep Briefing (Union Budget 2026)

**URL**: `http://localhost:3000/briefing?topic=union+budget+2026`

1. The page auto-generates a briefing from 22 pre-loaded budget articles
2. Wait ~15–30s for the 7 sections to synthesize (Groq rate limits apply)
3. Navigate sections using the sticky sidebar
4. Ask a question in the Q&A bar at the bottom (e.g. "What sectors benefit most?")
5. The answer shows which briefing section it came from

**Expected**: 7 sections loaded, Q&A returns sourced answer

---

### Demo 2 — Persona Comparison Feed

**URL**: `http://localhost:3000/feed`

1. Page loads automatically — fetches 22 budget articles and runs the pipeline
2. CFO column shows technical, macro-focused headlines
3. First-Gen Investor column shows simplified, actionable headlines
4. Generic Feed strip at top shows raw importance-ranked articles

**Expected**: 12 articles per persona column with rewritten headlines

> ⚠️ If you see "No articles available", the backend may be down. Check `http://127.0.0.1:8000/api/health`.

---

### Demo 3 — Hindi Video Generator

**URL**: `http://localhost:3000/video?topic=bankruptcy`

1. Click the **"Generate Hindi Video"** button
2. Watch the 5-step pipeline progress in real-time:
   - Step 1: Simplify to Hinglish (Groq creative call)
   - Step 2: Translate to Hindi Devanagari (Groq translation call)
   - Step 3: Generate TTS audio (gTTS, no API key needed)
   - Step 4: Calculate subtitle timings
   - Step 5: Assemble MP4 (requires ffmpeg)
3. Hinglish and Hindi scripts appear on screen
4. If ffmpeg is installed, a video player appears with the generated MP4

**Expected**: Both scripts displayed, PASS status if completed under 60s

---

### Agent Trace

**URL**: `http://localhost:3000/trace`

- Shows the mock trace of all 7 agent steps with timing
- Click any step to expand and see metadata (model used, article count, etc.)
- Click **Export JSON** to download the full trace

---

## Troubleshooting

### "No articles available" on Feed page
- The backend is not running → start it with `uvicorn main:app --reload --port 8000`
- Or the pipeline returned 0 articles (ChromaDB issue) → delete `backend/chroma_db/` folder and restart

### "RateLimitError" from Groq
- You've exceeded Groq's free tier token-per-minute limit
- Wait **30–60 seconds** and retry
- The pipeline has fallback methods — it will never completely fail, just use simpler outputs
- To avoid rate limits during demos: **don't click rapidly** — let each pipeline finish before starting another

### Video generation fails / no MP4 produced
- ffmpeg is not installed → follow Step 5 above
- `moviepy` errors: run `pip install moviepy pillow` in the backend directory
- Video files are saved to `backend/videos/` — check if the folder has any `.mp4` files

### ChromaDB errors on startup
```bash
# Delete the ChromaDB data and let it reinitialize
rm -rf backend/chroma_db/
# Restart the backend
```

### Backend won't start — port already in use
```bash
# Windows: Find and kill the process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Then restart
uvicorn main:app --reload --port 8000
```

### LLM calls failing with model errors
- Ensure `GROQ_API_KEY` is set in `.env`
- The system auto-loads `.env` via `python-dotenv` on startup
- After editing `.env`, restart the backend server

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROQ_API_KEY` | ✅ Yes | — | Groq API key for all LLM calls |
| `TAVILY_API_KEY` | No | — | Live news fetching (uses mock data if absent) |
| `GOOGLE_API_KEY` | No | — | Gemini models (not used by default) |
| `OPENAI_API_KEY` | No | — | OpenAI models (not used by default) |
| `ELEVENLABS_API_KEY` | No | — | Premium TTS voice (uses gTTS if absent) |
| `LLM_SYNTHESIS` | No | `groq/llama-3.3-70b-versatile` | Model for briefing synthesis |
| `LLM_EXTRACTION` | No | `groq/llama-3.1-8b-instant` | Model for entity extraction |
| `LLM_TRANSLATION` | No | `groq/llama-3.1-8b-instant` | Model for Hindi translation |
| `LLM_CREATIVE` | No | `groq/llama-3.3-70b-versatile` | Model for Hinglish simplification |
| `LLM_FAST` | No | `groq/llama-3.1-8b-instant` | Model for fast tasks (sentiment, orchestration) |

---

## Features Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| News ingestion (mock data) | ✅ Complete | 22 budget articles pre-loaded |
| News ingestion (Tavily live) | ✅ Complete | Requires `TAVILY_API_KEY` |
| ChromaDB deduplication | ✅ Complete | Cosine similarity at 0.92 threshold |
| Entity extraction | ✅ Complete | Companies, people, sectors, policies |
| Sentiment detection | ✅ Complete | Positive/negative/neutral + market impact |
| Importance scoring | ✅ Complete | Pure Python (recency + entities + impact) |
| CFO persona scoring | ✅ Complete | Keyword + sector weighted scoring |
| First-Gen persona scoring | ✅ Complete | Simplified keyword matching |
| Feed headline rewriting | ✅ Complete | Groq LLM per persona tone |
| Deep briefing (7 sections) | ✅ Complete | Groq synthesis |
| Briefing Q&A | ✅ Complete | ChromaDB semantic search + LLM answer |
| Hinglish simplification | ✅ Complete | Groq creative call |
| Hindi translation | ✅ Complete | Groq translation call |
| gTTS audio generation | ✅ Complete | No API key required |
| MP4 video assembly | ⚠️ Requires ffmpeg | MoviePy + Pillow |
| ReAct orchestration loop | ✅ Complete | Autonomous tool selection |
| Agent trace + export | ✅ Complete | Full step-by-step audit |
| Modern light UI | ✅ Complete | Tailwind CSS design system |

---

## License

MIT
