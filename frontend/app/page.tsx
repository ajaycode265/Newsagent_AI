'use client'

import Link from 'next/link'
import { Newspaper, Users, Video, Activity, Sparkles, TrendingUp, Globe, TrendingDown, BarChart2, Radio } from 'lucide-react'

const TICKER = [
  "RBI cuts repo rate 25bps to 5.25% — EMIs to fall",
  "Nifty 50 surges 1.2% on strong Q4 earnings",
  "India GDP projected at 6.5% for FY26 — IMF",
  "Budget 2026: ₹11.21 lakh crore capex retained",
  "TCS Q4 profit up 4.5% YoY at ₹12,224 crore",
  "SEBI tightens F&O margin norms from June 2025",
  "Rupee at 83.40 vs USD on RBI intervention",
  "Adani Green commissions 1,000 MW solar capacity",
]

const MOCK_ARTICLES = [
  {
    tag: "MARKETS", tagColor: "text-emerald-600 bg-emerald-50",
    headline: "Nifty scales new high as FII inflows surge ₹9,200 cr in single session",
    meta: "moneycontrol.com · 2h ago", score: 94,
    trend: "up",
  },
  {
    tag: "BUDGET", tagColor: "text-blue-600 bg-blue-50",
    headline: "Income tax slabs revised: Middle class gets ₹17,500 annual relief under new regime",
    meta: "economictimes.com · 4h ago", score: 91,
    trend: "up",
  },
  {
    tag: "ECONOMY", tagColor: "text-purple-600 bg-purple-50",
    headline: "India's manufacturing PMI hits 3-year high at 58.7 on export demand surge",
    meta: "livemint.com · 6h ago", score: 87,
    trend: "up",
  },
  {
    tag: "BANKING", tagColor: "text-amber-600 bg-amber-50",
    headline: "HDFC Bank Q4 NII up 10% YoY; gross NPA ratio improves to 1.24%",
    meta: "thehindu.com · 8h ago", score: 83,
    trend: "neutral",
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      {/* Breaking News Ticker */}
      <div className="bg-[var(--primary)] overflow-hidden">
        <div className="flex items-stretch">
          <div className="flex-shrink-0 flex items-center gap-2 bg-[var(--primary-dark)] px-4 py-2 z-10">
            <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
            <span className="text-white font-bold text-xs tracking-widest uppercase">Breaking</span>
          </div>
          <div className="overflow-hidden flex-1 py-2">
            <div className="flex gap-12 animate-[marquee_35s_linear_infinite] whitespace-nowrap">
              {[...TICKER, ...TICKER].map((h, i) => (
                <span key={i} className="text-white text-sm font-medium">
                  {h}<span className="opacity-30 mx-6">◆</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-[var(--border)]">

        {/* Newspaper column-grid background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/60 via-white to-slate-50/80" />
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.035) 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px'
        }} />
        {/* Soft red glow top-left */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-red-400 opacity-[0.06] blur-3xl pointer-events-none" />
        {/* Soft blue glow bottom-right */}
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-blue-400 opacity-[0.05] blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-4 py-14 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left — Headline + CTA */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/90 border border-[var(--border)] rounded-full px-4 py-1.5 mb-6 shadow-sm backdrop-blur">
                <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                <span className="text-sm font-medium text-[var(--text-secondary)]">Powered by Multi-Agent AI · Groq LLM · Tavily Live News</span>
              </div>

              <h1 className="display mb-4 leading-none">
                News<span className="gradient-text">Agent</span><br />
                <span className="text-4xl font-semibold text-[var(--text-secondary)]">AI</span>
              </h1>

              <p className="body-lg text-[var(--text-secondary)] mb-8 max-w-lg">
                A 6-agent autonomous pipeline that ingests live news, personalizes it for your persona, synthesizes deep briefings, and explains it in Hindi — in under 60 seconds.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Link href="/feed" className="btn btn-primary text-base px-6 py-3">
                  <TrendingUp className="w-5 h-5" />
                  Live Feed
                </Link>
                <Link href="/briefing?topic=union+budget+2026" className="btn btn-secondary text-base px-6 py-3">
                  <Newspaper className="w-5 h-5" />
                  Deep Briefing
                </Link>
                <Link href="/trace" className="btn btn-ghost text-base px-6 py-3">
                  <Activity className="w-5 h-5" />
                  Agent Trace
                </Link>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-2xl font-bold text-[var(--primary)]">6</div>
                  <div className="label">AI Agents</div>
                </div>
                <div className="w-px h-8 bg-[var(--border)]" />
                <div>
                  <div className="text-2xl font-bold text-[var(--accent-blue)]">15+</div>
                  <div className="label">Live Articles</div>
                </div>
                <div className="w-px h-8 bg-[var(--border)]" />
                <div>
                  <div className="text-2xl font-bold text-[var(--accent-green)]">&lt;60s</div>
                  <div className="label">Video Gen</div>
                </div>
                <div className="w-px h-8 bg-[var(--border)]" />
                <div>
                  <div className="text-2xl font-bold text-[var(--accent-purple)]">2</div>
                  <div className="label">Personas</div>
                </div>
              </div>
            </div>

            {/* Right — Newspaper front page mock */}
            <div className="hidden lg:block">
              <div className="bg-white/95 border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden backdrop-blur">

                {/* Masthead */}
                <div className="border-b-2 border-[var(--primary)] px-5 pt-4 pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                      <span className="text-xs font-bold text-[var(--primary)] tracking-widest uppercase">Live Intelligence Feed</span>
                    </div>
                    <span className="text-xs text-[var(--text-muted)] font-mono">
                      {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black tracking-tight">NewsAgent</span>
                    <span className="text-xl font-black tracking-tight text-[var(--primary)]">AI</span>
                    <span className="text-xs text-[var(--text-muted)] ml-auto">Powered by Groq · Tavily</span>
                  </div>
                </div>

                {/* Article list */}
                <div className="divide-y divide-[var(--border)]">
                  {MOCK_ARTICLES.map((a, i) => (
                    <div key={i} className="px-5 py-3.5 hover:bg-[var(--bg-secondary)] transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${a.tagColor}`}>
                              {a.tag}
                            </span>
                            <span className="text-[11px] text-[var(--text-muted)]">{a.meta}</span>
                          </div>
                          <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug line-clamp-2">
                            {a.headline}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <div className="text-xs font-bold text-[var(--primary)]">{a.score}</div>
                          {a.trend === 'up'
                            ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                            : <BarChart2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 bg-[var(--bg-secondary)] border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)]">Importance-ranked · AI rewritten per persona</span>
                  <Link href="/feed" className="text-xs font-semibold text-[var(--primary)] hover:underline">
                    View Live Feed →
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Demo Cards Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="headline-lg mb-3">Three Powerful Demos</h2>
          <p className="body text-[var(--text-secondary)]">Multi-agent AI pipeline — from raw news to personalized intelligence</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Link href="/briefing?topic=union+budget+2026" className="card-hover p-6 group">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
              <Newspaper className="w-6 h-6 text-[var(--accent-blue)]" />
            </div>
            <h3 className="headline-sm mb-2">Deep Briefing</h3>
            <p className="body-sm text-[var(--text-secondary)] mb-4">
              Synthesizes 22 budget articles into 7 non-overlapping sections. Ask Q&A with ChromaDB source attribution.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <span className="badge badge-blue">22 Articles</span>
              <span className="badge badge-blue">7 Sections</span>
            </div>
          </Link>

          <Link href="/feed" className="card-hover p-6 group">
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
              <Users className="w-6 h-6 text-[var(--accent-green)]" />
            </div>
            <h3 className="headline-sm mb-2">Live Persona Feed</h3>
            <p className="body-sm text-[var(--text-secondary)] mb-4">
              Search any topic. Same live news, AI-rewritten for CFO vs First-Gen Investor side-by-side.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <span className="badge badge-green">CFO View</span>
              <span className="badge badge-green">Investor View</span>
            </div>
          </Link>

          <Link href="/video?topic=bankruptcy" className="card-hover p-6 group">
            <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
              <Video className="w-6 h-6 text-[var(--accent-purple)]" />
            </div>
            <h3 className="headline-sm mb-2">Hindi Video</h3>
            <p className="body-sm text-[var(--text-secondary)] mb-4">
              Bankruptcy news → Hinglish simplification → Hindi translation → TTS audio → MP4 in &lt;60s.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <span className="badge badge-purple">Hindi TTS</span>
              <span className="badge badge-purple">&lt;60s</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Agent Pipeline Visual */}
      <div className="bg-[var(--bg-secondary)] py-16 border-y border-[var(--border)]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="headline-md mb-2">6-Agent Autonomous Pipeline</h2>
            <p className="body-sm text-[var(--text-secondary)]">Each news request runs through a full ReAct orchestration loop</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-5xl mx-auto">
            {[
              { label: "News Ingestion", sub: "Tavily + ChromaDB dedup", color: "bg-red-50 border-red-200 text-red-700" },
              { label: "→", sub: "", color: "text-[var(--text-muted)] bg-transparent border-transparent text-xl" },
              { label: "Processing", sub: "Entities · Sentiment · Importance", color: "bg-blue-50 border-blue-200 text-blue-700" },
              { label: "→", sub: "", color: "text-[var(--text-muted)] bg-transparent border-transparent text-xl" },
              { label: "User Profile", sub: "CFO / First-Gen scoring", color: "bg-green-50 border-green-200 text-green-700" },
              { label: "→", sub: "", color: "text-[var(--text-muted)] bg-transparent border-transparent text-xl" },
              { label: "Feed Agent", sub: "Top-15 · Headline rewrite", color: "bg-amber-50 border-amber-200 text-amber-700" },
              { label: "→", sub: "", color: "text-[var(--text-muted)] bg-transparent border-transparent text-xl" },
              { label: "Deep Briefing", sub: "7-section synthesis · Q&A", color: "bg-purple-50 border-purple-200 text-purple-700" },
              { label: "→", sub: "", color: "text-[var(--text-muted)] bg-transparent border-transparent text-xl" },
              { label: "Hindi Video", sub: "Hinglish → Hindi → MP4", color: "bg-pink-50 border-pink-200 text-pink-700" },
            ].map((step, i) => (
              step.label === "→" ? (
                <span key={i} className="text-[var(--text-muted)] text-lg font-light hidden sm:block">→</span>
              ) : (
                <div key={i} className={`border rounded-lg px-4 py-3 text-center ${step.color}`}>
                  <div className="text-xs font-bold">{step.label}</div>
                  {step.sub && <div className="text-[10px] opacity-70 mt-0.5 whitespace-nowrap">{step.sub}</div>}
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <h3 className="headline-sm mb-2">Multi-Article Synthesis</h3>
              <p className="body-sm text-[var(--text-secondary)]">
                Combines 15–22 live articles into 7 coherent, non-overlapping sections
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-[var(--accent-blue)]" />
              </div>
              <h3 className="headline-sm mb-2">Persona Personalization</h3>
              <p className="body-sm text-[var(--text-secondary)]">
                Same news, AI-rewritten headline and scoring for CFO and First-Gen Investor
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-[var(--accent-green)]" />
              </div>
              <h3 className="headline-sm mb-2">Vernacular Explanation</h3>
              <p className="body-sm text-[var(--text-secondary)]">
                Hinglish script → Hindi Devanagari → gTTS audio → MP4 video with subtitles
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-[var(--bg-secondary)] border-t border-[var(--border)] py-16 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="headline-lg mb-4">See the Full Agent Trace</h2>
          <p className="body text-[var(--text-secondary)] mb-8">
            Every agent step with timestamps, model used, article counts, and output metadata
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/trace" className="btn btn-primary">
              <Activity className="w-5 h-5" />
              View Agent Trace
            </Link>
            <Link href="/feed" className="btn btn-secondary">
              <TrendingUp className="w-5 h-5" />
              Open Live Feed
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
