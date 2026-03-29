'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { ArrowLeft, Users, Loader2 } from 'lucide-react'
import Link from 'next/link'
import ArticleCard, { ArticleCardSkeleton } from '../components/ArticleCard'

export default function FeedPage() {
  const [loading, setLoading] = useState(true)
  const [genericFeed, setGenericFeed] = useState<any[]>([])
  const [cfoFeed, setCfoFeed] = useState<any[]>([])
  const [investorFeed, setInvestorFeed] = useState<any[]>([])
  const [clickCount, setClickCount] = useState(0)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    loadFeeds()
  }, [])

  useEffect(() => {
    if (clickCount === 3) {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 4000)
    }
  }, [clickCount])

  const loadFeeds = async () => {
    setLoading(true)
    try {
      const [cfoRes, investorRes] = await Promise.all([
        axios.post('/api/feed', { topic: 'union budget 2026', persona: 'cfo' }),
        axios.post('/api/feed', { topic: 'union budget 2026', persona: 'first_gen' })
      ])
      
      setCfoFeed(cfoRes.data.feed || [])
      setInvestorFeed(investorRes.data.feed || [])
      setGenericFeed(cfoRes.data.feed || [])
    } catch (error) {
      console.error('Failed to load feeds:', error)
      setCfoFeed([])
      setInvestorFeed([])
      setGenericFeed([])
    } finally {
      setLoading(false)
    }
  }

  const handleArticleClick = () => {
    setClickCount(prev => prev + 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[var(--accent-red)] animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-[var(--accent-red)]" />
            <h1 className="headline-xl">Persona Comparison: <span className="text-[var(--accent-red)]">Feed Personalization</span></h1>
          </div>
          <p className="text-[var(--text-secondary)]">Same news, different perspectives - CFO vs First-Gen Investor side-by-side</p>
        </div>

        {/* Generic Feed Strip */}
        <div className="mb-8 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="headline-lg">GENERIC FEED</h2>
            <span className="caption">{genericFeed.length} articles, importance-ranked</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-16 min-w-[300px] rounded" />
              ))
            ) : (
              genericFeed.slice(0, 8).map((article, idx) => (
                <div 
                  key={article.id || idx}
                  className="min-w-[300px] bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-3 cursor-pointer hover:border-[var(--border-active)] transition-colors"
                  onClick={handleArticleClick}
                >
                  <div className="text-xs text-[var(--text-muted)] mb-1">
                    {article.tags?.[0] || 'NEWS'}
                  </div>
                  <div className="text-sm font-medium line-clamp-2 mb-2">
                    {article.headline}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="caption">Score: {Math.round(article.importance_score || 0)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Two-Column Persona Comparison */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* CFO Column */}
          <div>
            <div className="bg-[var(--bg-card)] border-l-4 border-[var(--accent-blue)] rounded-lg p-4 mb-4">
              <h2 className="headline-lg mb-1">CFO Perspective</h2>
              <p className="caption">Technical, macro-focused, data-driven</p>
            </div>
            
            <div className="space-y-4">
              {cfoFeed.length > 0 ? (
                cfoFeed.map((article, idx) => (
                  <ArticleCard 
                    key={article.id || idx}
                    article={article}
                    persona="cfo"
                    onClick={handleArticleClick}
                  />
                ))
              ) : (
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-8 text-center">
                  <p className="text-[var(--text-muted)]">No articles available</p>
                </div>
              )}
            </div>
          </div>

          {/* First-Gen Investor Column */}
          <div>
            <div className="bg-[var(--bg-card)] border-l-4 border-[var(--accent-green)] rounded-lg p-4 mb-4">
              <h2 className="headline-lg mb-1">First-Gen Investor</h2>
              <p className="caption">Simple, actionable, beginner-friendly</p>
            </div>
            
            <div className="space-y-4">
              {investorFeed.length > 0 ? (
                investorFeed.map((article, idx) => (
                  <ArticleCard 
                    key={article.id || idx}
                    article={article}
                    persona="first_gen"
                    onClick={handleArticleClick}
                  />
                ))
              ) : (
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-8 text-center">
                  <p className="text-[var(--text-muted)]">No articles available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Engagement Toast */}
        {showToast && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-[var(--bg-elevated)] border border-[var(--accent-green)] rounded-lg px-6 py-3 shadow-lg animate-[slideUp_0.3s_ease-out] z-50">
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
