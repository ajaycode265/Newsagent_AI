'use client'

import { useState } from 'react'
import { ArrowLeft, Download, ChevronDown, ChevronUp, Clock, Activity, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function TracePage() {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set())

  const mockTrace = [
    {
      step: "News Ingestion",
      agent: "NewsIngestionAgent",
      status: "completed",
      time_ms: 1250,
      timestamp: new Date().toISOString(),
      metadata: {
        source: "mock",
        original_count: 22,
        deduplicated_count: 22,
        duplicates_removed: 0
      }
    },
    {
      step: "Entity Extraction",
      agent: "ProcessingAgent",
      status: "completed",
      time_ms: 3400,
      timestamp: new Date().toISOString(),
      metadata: {
        articles_processed: 22,
        model: "gpt-4o-mini"
      }
    },
    {
      step: "Sentiment Detection",
      agent: "ProcessingAgent",
      status: "completed",
      time_ms: 2100,
      timestamp: new Date().toISOString(),
      metadata: {
        articles_processed: 22,
        batches: 5,
        model: "groq/llama3-8b-8192"
      }
    },
    {
      step: "Importance Scoring",
      agent: "ProcessingAgent",
      status: "completed",
      time_ms: 45,
      timestamp: new Date().toISOString(),
      metadata: {
        articles_processed: 22,
        method: "pure_python"
      }
    },
    {
      step: "Persona Scoring",
      agent: "UserProfileAgent",
      status: "completed",
      time_ms: 120,
      timestamp: new Date().toISOString(),
      metadata: {
        persona: "cfo",
        articles_scored: 22
      }
    },
    {
      step: "Personalised Feed Creation",
      agent: "PersonalisedFeedAgent",
      status: "completed",
      time_ms: 4200,
      timestamp: new Date().toISOString(),
      metadata: {
        persona: "cfo",
        total_articles: 22,
        selected_articles: 12,
        model: "groq/llama3-8b-8192"
      }
    },
    {
      step: "Deep Briefing Creation",
      agent: "DeepBriefingAgent",
      status: "completed",
      time_ms: 8500,
      timestamp: new Date().toISOString(),
      metadata: {
        topic: "union budget 2026",
        articles_count: 22,
        sections_count: 7,
        model: "gpt-4o"
      }
    }
  ]

  const totalTime = mockTrace.reduce((sum, step) => sum + step.time_ms, 0)
  const uniqueAgents = Array.from(new Set(mockTrace.map(step => step.agent)))

  const toggleStep = (idx: number) => {
    const newExpanded = new Set(expandedSteps)
    if (newExpanded.has(idx)) {
      newExpanded.delete(idx)
    } else {
      newExpanded.add(idx)
    }
    setExpandedSteps(newExpanded)
  }

  const exportTrace = () => {
    const dataStr = JSON.stringify(mockTrace, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `trace-${Date.now()}.json`
    link.click()
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-[var(--border)] sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="headline-xl mb-2">
                Agent <span className="gradient-text">Trace</span>
              </h1>
              <p className="body text-[var(--text-secondary)]">Complete audit trail of all agent actions and decisions</p>
            </div>
            <button
              onClick={exportTrace}
              className="btn btn-primary"
            >
              <Download className="w-5 h-5" />
              Export JSON
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 text-center">
            <div className="text-5xl font-bold text-[var(--primary)] mb-2">{mockTrace.length}</div>
            <div className="label">Total Steps</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-5xl font-bold text-[var(--accent-green)] mb-2">
              {(totalTime / 1000).toFixed(2)}s
            </div>
            <div className="label">Total Time</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-5xl font-bold text-[var(--accent-blue)] mb-2">{uniqueAgents.length}</div>
            <div className="label">Agents Used</div>
          </div>
        </div>

        {/* Trace Steps */}
        <div className="space-y-3">
        {mockTrace.map((trace, idx) => {
          const isExpanded = expandedSteps.has(idx)
          const agentColor = getAgentColor(trace.agent)
          
          return (
            <div key={idx} className="card overflow-hidden" style={{ borderLeftWidth: '4px', borderLeftColor: agentColor }}>
              <button
                onClick={() => toggleStep(idx)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-[var(--bg-hover)] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: agentColor }}>
                    {idx + 1}
                  </div>
                  <div className="text-left">
                    <h3 className="headline-sm">{trace.step}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="caption text-[var(--text-tertiary)]">{trace.agent}</span>
                      <span className="caption text-[var(--text-tertiary)]">•</span>
                      <span className="caption text-[var(--text-tertiary)]">{trace.time_ms}ms</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--accent-green)]" />
                    <span className="caption text-[var(--text-tertiary)]">
                      {new Date(trace.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-[var(--text-secondary)]" /> : <ChevronDown className="w-5 h-5 text-[var(--text-secondary)]" />}
                </div>
              </button>
              
              {isExpanded && (
                <div className="px-6 pb-6 border-t border-[var(--border)]">
                  <div className="mt-4">
                    <h4 className="headline-sm mb-3">Metadata</h4>
                    <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
                      <pre className="mono text-xs text-[var(--text-secondary)] overflow-x-auto">
{JSON.stringify(trace.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        </div>
      </div>
    </main>
  )
}

function getAgentColor(agent: string): string {
  const colors: Record<string, string> = {
    'NewsIngestionAgent': '#0066ff',
    'ProcessingAgent': '#8b5cf6',
    'UserProfileAgent': '#10b981',
    'PersonalisedFeedAgent': '#f59e0b',
    'DeepBriefingAgent': '#e8162a',
    'VernacularVideoAgent': '#06b6d4'
  }
  return colors[agent] || '#94a3b8'
}
