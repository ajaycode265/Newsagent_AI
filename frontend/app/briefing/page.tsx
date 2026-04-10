'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import { ArrowLeft, Loader2, Send, ChevronDown, ChevronUp, FileText, MessageCircle, Search, X } from 'lucide-react'
import Link from 'next/link'
import NewsTicker from '../components/NewsTicker'

const BRIEFING_TOPICS = [
  { label: 'Union Budget 2026', query: 'union budget 2026 India tax economy' },
  { label: 'RBI Rate Decision', query: 'RBI repo rate cut monetary policy India 2025' },
  { label: 'Nifty & Sensex', query: 'Nifty Sensex stock market rally India today' },
  { label: 'India Economy', query: 'India economy GDP inflation growth 2025' },
  { label: 'Startup Funding', query: 'India startup funding unicorn investment 2025' },
  { label: 'India Inflation', query: 'India inflation CPI WPI RBI 2025' },
  { label: 'SEBI & Markets', query: 'SEBI regulation stock market India investor 2025' },
  { label: 'Banking Sector', query: 'India banking HDFC SBI ICICI loan NPA 2025' },
  { label: 'IT & Tech', query: 'India IT technology Infosys TCS Wipro 2025' },
  { label: 'Adani Group', query: 'Adani Group ports airports energy business 2025' },
]

function BriefingContent() {
  const searchParams = useSearchParams()
  const initialTopic = searchParams.get('topic') || 'union budget 2026'

  const [activeTopic, setActiveTopic] = useState(initialTopic)
  const [inputValue, setInputValue] = useState(initialTopic)
  const [loading, setLoading] = useState(true)
  const [briefing, setBriefing] = useState<any>(null)
  const [sessionId, setSessionId] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<any>(null)
  const [askingQuestion, setAskingQuestion] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadBriefing(activeTopic)
  }, [activeTopic])

  const loadBriefing = async (t: string) => {
    setLoading(true)
    setBriefing(null)
    setAnswer(null)
    try {
      const res = await axios.post('/api/briefing/generate', { topic: t })
      setBriefing(res.data.briefing)
      setSessionId(res.data.session_id)
      setExpandedSections(new Set(Object.keys(res.data.briefing.sections || {})))
    } catch (error) {
      console.error('Failed to load briefing:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) setActiveTopic(inputValue.trim())
  }

  const handleTrendingClick = (t: { label: string; query: string }) => {
    setInputValue(t.query)
    setActiveTopic(t.query)
  }

  const askQuestion = async () => {
    if (!question.trim() || !sessionId) return
    
    setAskingQuestion(true)
    try {
      const res = await axios.post('/api/briefing/ask', {
        question,
        session_id: sessionId
      })
      setAnswer(res.data)
    } catch (error) {
      console.error('Failed to ask question:', error)
    } finally {
      setAskingQuestion(false)
    }
  }

  const toggleSection = (key: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedSections(newExpanded)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin" />
        <p className="text-[var(--text-secondary)]">Fetching live news for <strong>"{activeTopic}"</strong>...</p>
        <p className="text-[var(--text-muted)] text-sm">Processing · Synthesizing · Building briefing</p>
      </div>
    )
  }

  const sections = briefing?.sections || {}
  const sectionKeys = Object.keys(sections)

  return (
    <main className="min-h-screen bg-white pb-32">

      {/* Ticker */}
      <NewsTicker />

      {/* Header */}
      <div className="relative sticky top-0 z-10 border-b border-[var(--border)] overflow-hidden">
        {/* Newspaper grid background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-white to-slate-50/70" />
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)`,
          backgroundSize: '72px 72px'
        }} />
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-red-400 opacity-[0.05] blur-3xl pointer-events-none" />
        <div className="relative container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          {/* Topic Search */}
          <form onSubmit={handleSearch} className="mb-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Enter any business topic for a live briefing..."
                  className="w-full pl-9 pr-9 py-2.5 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
                {inputValue && (
                  <button type="button" onClick={() => setInputValue('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button type="submit" className="px-4 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" /> Generate
              </button>
            </div>
          </form>

          {/* Trending Chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {BRIEFING_TOPICS.map(t => (
              <button
                key={t.label}
                onClick={() => handleTrendingClick(t)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  activeTopic === t.query
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="headline-xl mb-1">
                Deep Briefing: <span className="gradient-text">{activeTopic}</span>
              </h1>
              <p className="body text-[var(--text-secondary)]">
                {sectionKeys.length} sections synthesized from live news
              </p>
            </div>
            <div className="badge badge-primary">
              <FileText className="w-3 h-3" />
              {sectionKeys.length} Sections
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-4 sticky top-24">
              <h2 className="headline-sm mb-4">Sections</h2>
              <div className="space-y-1">
                {sectionKeys.map((key, idx) => (
                  <button
                    key={key}
                    onClick={() => {
                      const element = document.getElementById(key)
                      element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors text-sm group flex items-center gap-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-xs font-semibold group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                      {idx + 1}
                    </div>
                    <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                      {sections[key].title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
          {sectionKeys.map((key, idx) => {
            const section = sections[key]
            const isExpanded = expandedSections.has(key)
            
            return (
              <div key={key} id={key} className="card overflow-hidden scroll-mt-24">
                <button
                  onClick={() => toggleSection(key)}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <div className="text-left flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="headline-md mb-1">{section.title}</h3>
                      <p className="caption text-[var(--text-tertiary)]">{section.category}</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-[var(--text-secondary)] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[var(--text-secondary)] flex-shrink-0" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-[var(--border)]">
                    <div className="pt-4">
                      <p className="body text-[var(--text-primary)] leading-relaxed whitespace-pre-line">
                        {section.content}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          </div>
        </div>
      </div>

      {/* Q&A Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border)] shadow-xl">
        <div className="container mx-auto max-w-4xl p-4">
          {answer && (
            <div className="mb-4 card p-4 bg-[var(--bg-secondary)]">
              <div className="flex items-start gap-3 mb-3">
                <MessageCircle className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="label mb-2">Answer</p>
                  <p className="body text-[var(--text-primary)] mb-2">{answer.answer}</p>
                  {answer.source_section && (
                    <div className="badge badge-primary">
                      Source: {answer.source_section}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !askingQuestion && askQuestion()}
              placeholder="Ask a question about the briefing..."
              className="flex-1 px-4 py-3 bg-white border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 transition-all"
            />
            <button
              onClick={askQuestion}
              disabled={askingQuestion || !question.trim()}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {askingQuestion ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Ask
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function BriefingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>}>
      <BriefingContent />
    </Suspense>
  )
}
