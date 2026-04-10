'use client'

import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { ArrowLeft, Users, Loader2, Search, Radio, X } from 'lucide-react'
import Link from 'next/link'
import ArticleCard, { ArticleCardSkeleton } from '../components/ArticleCard'
import NewsTicker from '../components/NewsTicker'

const TRENDING_TOPICS = [
  { label: 'Top Business News', query: 'India top business financial news today 2025' },
  { label: 'Union Budget 2026', query: 'union budget 2026 India tax economy' },
  { label: 'RBI Rate Decision', query: 'RBI repo rate cut monetary policy India 2025' },
  { label: 'Nifty & Sensex', query: 'Nifty Sensex stock market rally India today' },
  { label: 'India Economy', query: 'India economy GDP inflation growth 2025' },
  { label: 'Startup Funding', query: 'India startup funding unicorn investment 2025' },
  { label: 'SEBI & Markets', query: 'SEBI regulation stock market India investor 2025' },
  { label: 'Adani Group', query: 'Adani Group ports airports energy business 2025' },
  { label: 'IT & Tech', query: 'India IT technology Infosys TCS Wipro 2025' },
  { label: 'Banking Sector', query: 'India banking HDFC SBI ICICI loan NPA 2025' },
]

export default function FeedPage() {
  const [loading, setLoading] = useState(false)
  const [genericFeed, setGenericFeed] = useState<any[]>([])
  const [cfoFeed, setCfoFeed] = useState<any[]>([])
  const [investorFeed, setInvestorFeed] = useState<any[]>([])
  const [clickCount, setClickCount] = useState(0)
  const [showToast, setShowToast] = useState(false)
  const [topic, setTopic] = useState('India top business financial news today 2025')
  const [inputValue, setInputValue] = useState('India top business financial news today 2025')
  const [activeTopic, setActiveTopic] = useState('Top Business News')
  const [articleCount, setArticleCount] = useState(0)
  const [isLive, setIsLive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadFeeds(topic)
  }, [topic])

  useEffect(() => {
    if (clickCount === 3) {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 4000)
    }
  }, [clickCount])

  const loadFeeds = async (searchTopic: string) => {
    setLoading(true)
    setCfoFeed([])
    setInvestorFeed([])
    setGenericFeed([])
    try {
      const [cfoRes, investorRes] = await Promise.all([
        axios.post('/api/feed', { topic: searchTopic, persona: 'cfo' }),
        axios.post('/api/feed', { topic: searchTopic, persona: 'first_gen' })
      ])
      const cfo = cfoRes.data.feed || []
      const investor = investorRes.data.feed || []
      setCfoFeed(cfo)
      setInvestorFeed(investor)
      setGenericFeed(cfo)
      setArticleCount(cfoRes.data.metadata?.total_articles || cfo.length)
      setIsLive(cfoRes.data.metadata?.source === 'tavily' || searchTopic !== 'union budget 2026')
    } catch (error) {
      console.error('Failed to load feeds:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      setActiveTopic(inputValue.trim())
      setTopic(inputValue.trim())
    }
  }

  const handleTrendingClick = (t: { label: string; query: string }) => {
    setActiveTopic(t.label)
    setInputValue(t.query)
    setTopic(t.query)
  }

  const handleArticleClick = () => setClickCount(prev => prev + 1)

  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">

      {/* Ticker */}
      <NewsTicker />

      {/* Page Header with newspaper background */}
      <div className="relative overflow-hidden border-b border-[var(--border)] mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-white to-slate-50/70" />
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)`,
          backgroundSize: '72px 72px'
        }} />
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-red-400 opacity-[0.05] blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-[var(--border)] flex items-center justify-center">
              <Users className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <h1 className="headline-xl">Persona Comparison: <span className="gradient-text">Live Feed</span></h1>
            {isLive && !loading && (
              <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                <Radio className="w-3 h-3 animate-pulse" /> LIVE
              </span>
            )}
          </div>
          <p className="text-[var(--text-secondary)] mb-5">Search any topic — same news, different perspectives for CFO vs First-Gen Investor</p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Search live business news... e.g. RBI rate cut, Sensex rally"
                className="w-full pl-9 pr-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent-red)] transition-colors"
              />
              {inputValue && (
                <button type="button" onClick={() => setInputValue('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 bg-[var(--accent-red)] text-white rounded-lg font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? 'Fetching...' : 'Search'}
            </button>
          </div>
        </form>

          {/* Trending Topics */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-[var(--text-muted)] font-medium self-center mr-1">Trending:</span>
            {TRENDING_TOPICS.map(t => (
              <button
                key={t.label}
                onClick={() => handleTrendingClick(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  activeTopic === t.label
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                    : 'bg-white border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>{/* /container */}
      </div>{/* /newspaper bg header */}

      <div className="container mx-auto px-4 py-6">

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-[var(--accent-red)] animate-spin" />
            <p className="text-[var(--text-secondary)] text-sm">Fetching live news for <strong>"{activeTopic}"</strong> via Tavily...</p>
            <p className="text-[var(--text-muted)] text-xs">Processing entities · Scoring personas · Rewriting headlines</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Generic Feed Strip */}
            <div className="mb-8 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="headline-lg">GENERIC FEED</h2>
                  {isLive && (
                    <span className="text-xs text-red-500 font-semibold border border-red-200 bg-red-50 px-2 py-0.5 rounded">LIVE</span>
                  )}
                </div>
                <span className="caption">{genericFeed.length} articles · importance-ranked</span>
              </div>
              {genericFeed.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm text-center py-4">No articles found. Try a different topic.</p>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {genericFeed.slice(0, 8).map((article, idx) => (
                    <div
                      key={article.id || idx}
                      className="min-w-[300px] bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-3 cursor-pointer hover:border-[var(--border-active)] transition-colors"
                      onClick={handleArticleClick}
                    >
                      <div className="text-xs text-[var(--text-muted)] mb-1">{article.source || article.tags?.[0] || 'NEWS'}</div>
                      <div className="text-sm font-medium line-clamp-2 mb-2">{article.headline}</div>
                      <span className="caption">Score: {Math.round(article.importance_score || 0)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Two-Column Persona Comparison */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* CFO Column */}
              <div>
                <div className="bg-[var(--bg-card)] border-l-4 border-[var(--accent-blue)] rounded-lg p-4 mb-4">
                  <h2 className="headline-lg mb-1">CFO Perspective</h2>
                  <p className="caption">Technical, macro-focused, data-driven · {cfoFeed.length} articles</p>
                </div>
                <div className="space-y-4">
                  {cfoFeed.length > 0 ? (
                    cfoFeed.map((article, idx) => (
                      <ArticleCard key={article.id || idx} article={article} persona="cfo" onClick={handleArticleClick} />
                    ))
                  ) : (
                    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-8 text-center">
                      <p className="text-[var(--text-muted)]">No articles found for this topic</p>
                    </div>
                  )}
                </div>
              </div>

              {/* First-Gen Investor Column */}
              <div>
                <div className="bg-[var(--bg-card)] border-l-4 border-[var(--accent-green)] rounded-lg p-4 mb-4">
                  <h2 className="headline-lg mb-1">First-Gen Investor</h2>
                  <p className="caption">Simple, actionable, beginner-friendly · {investorFeed.length} articles</p>
                </div>
                <div className="space-y-4">
                  {investorFeed.length > 0 ? (
                    investorFeed.map((article, idx) => (
                      <ArticleCard key={article.id || idx} article={article} persona="first_gen" onClick={handleArticleClick} />
                    ))
                  ) : (
                    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-8 text-center">
                      <p className="text-[var(--text-muted)]">No articles found for this topic</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Engagement Toast */}
        {showToast && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-[var(--bg-elevated)] border border-[var(--accent-green)] rounded-lg px-6 py-3 shadow-lg z-50">
            <div className="flex items-center gap-2">
              <span className="text-[var(--accent-green)]">✦</span>
              <span className="text-sm">Feed updated based on your reading patterns</span>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
