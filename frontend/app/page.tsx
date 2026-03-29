'use client'

import Link from 'next/link'
import { Newspaper, Users, Video, Activity, Sparkles, TrendingUp, Globe } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-blue-50 opacity-60" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.03) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white border border-[var(--border)] rounded-full px-4 py-2 mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-[var(--primary)]" />
              <span className="text-sm font-medium text-[var(--text-secondary)]">Powered by Multi-Agent AI</span>
            </div>
            
            <h1 className="display mb-6">
              My<span className="gradient-text">ET</span> AI
            </h1>
            
            <p className="body-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
              Transform static business news into intelligent, personalized briefings with multi-agent AI pipeline
            </p>
            
            <div className="flex items-center justify-center gap-4 mb-12">
              <Link href="/feed" className="btn btn-primary">
                <TrendingUp className="w-5 h-5" />
                Explore Demos
              </Link>
              <Link href="/trace" className="btn btn-secondary">
                <Activity className="w-5 h-5" />
                View Agent Trace
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="headline-lg text-[var(--primary)] mb-1">6</div>
                <div className="label">AI Agents</div>
              </div>
              <div className="text-center">
                <div className="headline-lg text-[var(--accent-blue)] mb-1">2</div>
                <div className="label">Personas</div>
              </div>
              <div className="text-center">
                <div className="headline-lg text-[var(--accent-green)] mb-1">&lt;60s</div>
                <div className="label">Video Gen</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Cards Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="headline-lg mb-3">Experience AI-Powered News</h2>
          <p className="body text-[var(--text-secondary)]">Three powerful demonstrations of multi-agent intelligence</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Link href="/briefing?topic=union+budget+2026" className="card-hover p-6 group">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
              <Newspaper className="w-6 h-6 text-[var(--accent-blue)]" />
            </div>
            <h3 className="headline-sm mb-2">Budget Briefing</h3>
            <p className="body-sm text-[var(--text-secondary)] mb-4">
              Multi-article synthesis combining 22 budget articles into 7 structured sections with Q&A
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
            <h3 className="headline-sm mb-2">Persona Comparison</h3>
            <p className="body-sm text-[var(--text-secondary)] mb-4">
              Same news, different perspectives - CFO vs First-Gen Investor side-by-side
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
              Bankruptcy news → Hindi explanation with video in under 60 seconds
            </p>
            <div className="flex items-center gap-4 text-xs">
              <span className="badge badge-purple">Hindi TTS</span>
              <span className="badge badge-purple">&lt;60s</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-[var(--bg-secondary)] py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <h3 className="headline-sm mb-2">Multi-Article Synthesis</h3>
              <p className="body-sm text-[var(--text-secondary)]">
                Combines 5-15 articles into coherent, non-overlapping sections
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-[var(--accent-blue)]" />
              </div>
              <h3 className="headline-sm mb-2">Persona-Based Personalization</h3>
              <p className="body-sm text-[var(--text-secondary)]">
                Tailored content for CFO and First-Gen Investor profiles
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-[var(--accent-green)]" />
              </div>
              <h3 className="headline-sm mb-2">Vernacular Explanation</h3>
              <p className="body-sm text-[var(--text-secondary)]">
                Hindi video generation with TTS and subtitles
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="headline-lg mb-4">See the AI Pipeline in Action</h2>
          <p className="body text-[var(--text-secondary)] mb-8">
            View complete agent trace with timestamps, inputs, and outputs
          </p>
          <Link href="/trace" className="btn btn-primary">
            <Activity className="w-5 h-5" />
            View Agent Trace
          </Link>
        </div>
      </div>
    </main>
  )
}
