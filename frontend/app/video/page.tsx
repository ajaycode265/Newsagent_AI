'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import { ArrowLeft, Play, Loader2, CheckCircle, XCircle, Clock, Video as VideoIcon } from 'lucide-react'
import Link from 'next/link'

export default function VideoPage() {
  const searchParams = useSearchParams()
  const topic = searchParams.get('topic') || 'bankruptcy'
  
  const [generating, setGenerating] = useState(false)
  const [videoData, setVideoData] = useState<any>(null)
  const [traceSteps, setTraceSteps] = useState<any[]>([])

  const generateVideo = async () => {
    setGenerating(true)
    setVideoData(null)
    setTraceSteps([])
    
    try {
      const res = await axios.post('/api/video/generate', { topic })
      setVideoData(res.data.video_data)
      setTraceSteps(res.data.trace || [])
    } catch (error) {
      console.error('Failed to generate video:', error)
    } finally {
      setGenerating(false)
    }
  }

  const totalTime = traceSteps.reduce((sum, step) => sum + (step.time_ms || 0), 0)
  const status = totalTime < 60000 ? 'PASS' : 'FAIL'

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-[var(--border)]">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="headline-xl mb-2">
                Hindi Video Generator: <span className="gradient-text">Vernacular Explanation</span>
              </h1>
              <p className="body text-[var(--text-secondary)]">
                Transform complex business news into simple Hindi video explanations
              </p>
            </div>
            {totalTime > 0 && (
              <div className={`badge ${status === 'PASS' ? 'badge-green' : 'badge-primary'} text-lg px-4 py-2`}>
                {status} - {(totalTime / 1000).toFixed(1)}s
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Generate & Content */}
          <div className="space-y-6">
            {/* Generate Card */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <VideoIcon className="w-5 h-5 text-[var(--accent-purple)]" />
                </div>
                <div>
                  <h2 className="headline-md">Generate Video</h2>
                  <p className="caption text-[var(--text-tertiary)]">Topic: {topic}</p>
                </div>
              </div>
              <button
                onClick={generateVideo}
                disabled={generating}
                className="btn btn-primary w-full disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Generate Hindi Video
                  </>
                )}
              </button>
            </div>

            {videoData && (
              <div className="space-y-4">
                <div className="card p-6">
                  <h3 className="headline-sm mb-4">English Script (Hinglish)</h3>
                  <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
                    <p className="body text-[var(--text-primary)] whitespace-pre-line leading-relaxed">
                      {videoData.hinglish_script}
                    </p>
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="headline-sm mb-4">Hindi Script (Devanagari)</h3>
                  <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
                    <p className="body text-[var(--text-primary)] whitespace-pre-line leading-relaxed" style={{ fontFamily: 'var(--font-devanagari)' }}>
                      {videoData.hindi_script}
                    </p>
                  </div>
                </div>

                {videoData.video_path && (
                  <div className="card p-6">
                    <h3 className="headline-sm mb-4">Generated Video</h3>
                    <video
                      controls
                      className="w-full rounded-lg border border-[var(--border)]"
                      src={videoData.video_path}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-5 h-5 text-[var(--accent-purple)]" />
                <h2 className="headline-md">Pipeline Progress</h2>
              </div>
              
              {traceSteps.length === 0 && !generating && (
                <div className="text-center py-12">
                  <VideoIcon className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
                  <p className="body text-[var(--text-secondary)]">
                    Click "Generate Hindi Video" to start the pipeline
                  </p>
                </div>
              )}

              {/* Vertical Timeline */}
              <div className="relative">
                {traceSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-4 pb-6 last:pb-0">
                    {/* Timeline Line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.status === 'completed' ? 'bg-green-100' :
                        step.status === 'failed' ? 'bg-red-100' :
                        'bg-blue-100'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-[var(--accent-green)]" />
                        ) : step.status === 'failed' ? (
                          <XCircle className="w-5 h-5 text-[var(--primary)]" />
                        ) : (
                          <Loader2 className="w-5 h-5 text-[var(--accent-blue)] animate-spin" />
                        )}
                      </div>
                      {idx < traceSteps.length - 1 && (
                        <div className="w-0.5 h-full bg-[var(--border)] mt-2" />
                      )}
                    </div>
                    
                    {/* Step Content */}
                    <div className="flex-1 pb-2">
                      <h3 className="headline-sm mb-1">{step.step_name}</h3>
                      <p className="caption text-[var(--text-tertiary)] mb-2">
                        {step.agent} · {step.time_ms}ms
                      </p>
                      {step.metadata && Object.keys(step.metadata).length > 0 && (
                        <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border)]">
                          <pre className="mono text-xs text-[var(--text-secondary)] overflow-x-auto">
                            {JSON.stringify(step.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Time Summary */}
              {totalTime > 0 && (
                <div className="mt-6 pt-6 border-t border-[var(--border)]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="headline-sm">Total Time</span>
                    <span className={`text-3xl font-bold mono ${
                      status === 'PASS' ? 'text-[var(--accent-green)]' : 'text-[var(--primary)]'
                    }`}>
                      {(totalTime / 1000).toFixed(2)}s
                    </span>
                  </div>
                  <div className="text-center">
                    <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-lg ${
                      status === 'PASS' ? 'bg-green-100 text-[var(--accent-green)]' : 'bg-red-100 text-[var(--primary)]'
                    }`}>
                      {status === 'PASS' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      {status}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
