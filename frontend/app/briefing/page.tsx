'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import { ArrowLeft, Loader2, Send, ChevronDown, ChevronUp, FileText, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function BriefingPage() {
  const searchParams = useSearchParams()
  const topic = searchParams.get('topic') || 'union budget 2026'
  
  const [loading, setLoading] = useState(true)
  const [briefing, setBriefing] = useState<any>(null)
  const [sessionId, setSessionId] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<any>(null)
  const [askingQuestion, setAskingQuestion] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadBriefing()
  }, [topic])

  const loadBriefing = async () => {
    setLoading(true)
    try {
      const res = await axios.post('/api/briefing/generate', { topic })
      setBriefing(res.data.briefing)
      setSessionId(res.data.session_id)
      setExpandedSections(new Set(Object.keys(res.data.briefing.sections || {})))
    } catch (error) {
      console.error('Failed to load briefing:', error)
    } finally {
      setLoading(false)
    }
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Generating briefing...</p>
        </div>
      </div>
    )
  }

  const sections = briefing?.sections || {}
  const sectionKeys = Object.keys(sections)

  return (
    <main className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="bg-white border-b border-[var(--border)] sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="headline-xl mb-2">
                Deep Briefing: <span className="gradient-text">{topic}</span>
              </h1>
              <p className="body text-[var(--text-secondary)]">
                Synthesized from {sectionKeys.length} articles into {sectionKeys.length} non-overlapping sections
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
