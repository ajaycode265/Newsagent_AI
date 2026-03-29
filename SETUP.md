# MyET AI - Setup Guide

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn
- API Keys (at least one LLM provider)

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install Python dependencies**
```bash
pip install -r requirements.txt
```

3. **Create .env file**
```bash
cp ../.env.example .env
```

4. **Add your API keys to .env**
```env
# Required - at least one LLM provider
OPENAI_API_KEY=your_openai_key_here
# OR
GROQ_API_KEY=your_groq_key_here
# OR
GOOGLE_API_KEY=your_google_key_here

# Optional
TAVILY_API_KEY=your_tavily_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
```

5. **Run the backend**
```bash
python main.py
```

Backend will start on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

Frontend will start on `http://localhost:3000`

## Testing the Demos

### Demo 1: Budget Briefing
1. Open `http://localhost:3000`
2. Click "Demo 1: Budget Briefing"
3. Wait for 22 articles to be synthesized into 7 sections
4. Ask questions in the Q&A bar at the bottom
5. Observe source section attribution in answers

### Demo 2: Persona Comparison
1. Click "Demo 2: Persona Comparison"
2. Compare generic feed vs CFO vs First-Gen Investor
3. Notice rewritten headlines (highlighted in yellow)
4. Observe different article rankings per persona

### Demo 3: Hindi Video
1. Click "Demo 3: Hindi Video"
2. Click "Generate Hindi Video"
3. Watch the 5-step pipeline progress
4. View generated Hinglish and Hindi scripts
5. Play the generated MP4 video (if MoviePy is installed)

### Agent Trace
- Click "View Agent Trace" to see complete audit trail
- Export trace as JSON for analysis

## Architecture

### Backend (FastAPI)
- **LLM Router** (`backend/llm/router.py`): Centralized LLM calls with LiteLLM
- **6 Agents** (`backend/agents/`):
  - NewsIngestionAgent: Fetch & deduplicate articles
  - ProcessingAgent: Entity extraction, sentiment, importance
  - UserProfileAgent: Persona scoring (CFO vs First-Gen)
  - PersonalisedFeedAgent: Headline rewriting per persona
  - DeepBriefingAgent: Multi-article synthesis + Q&A
  - VernacularVideoAgent: Hindi video generation
- **Orchestrator** (`backend/orchestrator/`): ReAct loop for autonomous pipeline
- **ChromaDB**: Vector storage for deduplication and Q&A routing

### Frontend (Next.js 14)
- **App Router** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Server-Sent Events** for real-time pipeline updates

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/pipeline/run` | POST | SSE stream of full agent pipeline |
| `/api/feed` | POST | Get personalized feed for persona |
| `/api/briefing/generate` | POST | Create multi-article briefing |
| `/api/briefing/ask` | POST | Q&A with source attribution |
| `/api/video/generate` | POST | Generate Hindi video |
| `/api/video/status/:id` | GET | Check video generation status |
| `/api/trace/:session` | GET | Get agent trace for session |

## Mock Data

The system includes 3 mock data files for offline demos:

1. **budget_articles.json**: 22 Union Budget articles
2. **feed_articles.json**: 15 articles for persona comparison
3. **bankruptcy_article.json**: 1 article for Hindi video demo

## Troubleshooting

### Video Generation Issues
If video generation fails:
1. Install ffmpeg: `choco install ffmpeg` (Windows)
2. Install MoviePy dependencies: `pip install moviepy pillow`
3. For font errors, the system uses default fonts as fallback

### LLM API Errors
- Ensure at least one LLM provider API key is set
- Check API key validity and rate limits
- System falls back to mock data if Tavily fails

### ChromaDB Errors
- Delete `chroma_db/` folder and restart backend
- ChromaDB will reinitialize automatically

## Production Deployment

### Backend (Railway/Render)
```bash
# Add to railway.toml or render.yaml
build:
  - pip install -r requirements.txt
start:
  - uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Frontend (Vercel)
```bash
npm run build
# Deploy to Vercel
vercel deploy
```

## Environment Variables for Production

```env
# Backend
LLM_SYNTHESIS=gpt-4o
LLM_EXTRACTION=gpt-4o-mini
LLM_TRANSLATION=gpt-4o-mini
LLM_CREATIVE=gpt-4o
LLM_FAST=groq/llama3-8b-8192

OPENAI_API_KEY=
GROQ_API_KEY=
TAVILY_API_KEY=

# Frontend (Vercel)
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

## Key Features Implemented

✅ Multi-article synthesis (22 articles → 7 sections)  
✅ Persona-based personalization (CFO vs First-Gen)  
✅ Headline rewriting per persona  
✅ ChromaDB semantic Q&A routing  
✅ Hindi video generation with TTS  
✅ Full agent trace with timestamps  
✅ ReAct orchestration loop  
✅ LiteLLM multi-provider routing  
✅ Fallback to mock data  
✅ SSE streaming for real-time updates  

## License

MIT
