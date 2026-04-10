'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import { ArrowLeft, Play, Loader2, CheckCircle, Video as VideoIcon, Search, X, Headphones, Volume2 } from 'lucide-react'
import Link from 'next/link'
import NewsTicker from '../components/NewsTicker'

const VIDEO_TOPICS = [
  { label: 'Bankruptcy', query: 'India company bankruptcy insolvency NCLT 2025' },
  { label: 'RBI Rate Cut', query: 'RBI repo rate cut monetary policy India 2025' },
  { label: 'Sensex Rally', query: 'Nifty Sensex stock market rally India today' },
  { label: 'Startup Funding', query: 'India startup funding unicorn investment 2025' },
  { label: 'Union Budget', query: 'union budget 2026 India tax economy' },
  { label: 'Inflation', query: 'India inflation CPI WPI RBI 2025' },
  { label: 'IT Sector', query: 'India IT technology Infosys TCS Wipro 2025' },
  { label: 'Banking NPA', query: 'India banking NPA bad loans HDFC SBI 2025' },
]

const VIDEO_PHASES = [
  { target: 10, label: 'Fetching live news…' },
  { target: 28, label: 'Writing Hinglish script…' },
  { target: 46, label: 'Translating to Hindi…' },
  { target: 63, label: 'Generating TTS audio…' },
  { target: 78, label: 'Building subtitles…' },
  { target: 94, label: 'Assembling MP4 video…' },
]

const AUDIO_PHASES = [
  { target: 18, label: 'Fetching live news…' },
  { target: 45, label: 'Writing Hinglish script…' },
  { target: 72, label: 'Translating to Hindi…' },
  { target: 92, label: 'Generating TTS audio…' },
]

function VideoContent() {
  const searchParams = useSearchParams()
  const initialTopic = searchParams.get('topic') || 'bankruptcy'

  const [selectedTopic, setSelectedTopic] = useState(initialTopic)
  const [activeLabel, setActiveLabel] = useState('Bankruptcy')
  const [customInput, setCustomInput] = useState(initialTopic)

  const [generating, setGenerating] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [videoPhase, setVideoPhase] = useState('')
  const [videoData, setVideoData] = useState<any>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const videoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [audioLoading, setAudioLoading] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioPhase, setAudioPhase] = useState('')
  const [audioData, setAudioData] = useState<any>(null)
  const [audioJobId, setAudioJobId] = useState<string | null>(null)
  const [audioError, setAudioError] = useState<string | null>(null)
  const audioIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startProgress = (
    phases: typeof VIDEO_PHASES,
    setter: (v: number) => void,
    phaseSetter: (s: string) => void,
    tickMs: number
  ) => {
    let phaseIdx = 0
    let progress = 0
    return setInterval(() => {
      const phase = phases[phaseIdx]
      if (!phase) return
      if (progress < phase.target) {
        progress += 1
        setter(progress)
        phaseSetter(phase.label)
      } else if (phaseIdx < phases.length - 1) {
        phaseIdx++
      }
    }, tickMs)
  }

  const generateVideo = async () => {
    setGenerating(true)
    setVideoData(null)
    setJobId(null)
    setVideoProgress(0)
    setVideoPhase('Starting…')
    if (videoIntervalRef.current) clearInterval(videoIntervalRef.current)
    videoIntervalRef.current = startProgress(VIDEO_PHASES, setVideoProgress, setVideoPhase, 450)
    try {
      const res = await axios.post('/api/video/generate', { topic: selectedTopic })
      clearInterval(videoIntervalRef.current!)
      setVideoProgress(100)
      setVideoPhase('Complete!')
      setVideoData(res.data.video_data)
      setJobId(res.data.job_id || null)
    } catch (error) {
      clearInterval(videoIntervalRef.current!)
      setVideoProgress(0)
      setVideoPhase('Failed')
      console.error('Failed to generate video:', error)
    } finally {
      setGenerating(false)
    }
  }

  const generateAudio = async () => {
    setAudioLoading(true)
    setAudioData(null)
    setAudioJobId(null)
    setAudioError(null)
    setAudioProgress(0)
    setAudioPhase('Starting…')
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current)
    audioIntervalRef.current = startProgress(AUDIO_PHASES, setAudioProgress, setAudioPhase, 250)
    try {
      const res = await axios.post('/api/audio/generate', { topic: selectedTopic })
      clearInterval(audioIntervalRef.current!)
      setAudioProgress(100)
      setAudioPhase('Complete!')
      setAudioData(res.data)
      setAudioJobId(res.data.job_id || null)
    } catch (err: any) {
      clearInterval(audioIntervalRef.current!)
      setAudioProgress(0)
      setAudioPhase('Failed')
      setAudioError(err?.response?.data?.detail || 'Audio generation failed')
    } finally {
      setAudioLoading(false)
    }
  }

  const handleTopicChip = (label: string, query: string) => {
    setActiveLabel(label)
    setCustomInput(query)
    setSelectedTopic(query)
  }

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (customInput.trim()) {
      setActiveLabel(customInput.trim())
      setSelectedTopic(customInput.trim())
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <NewsTicker />

      {/* Header */}
      <div className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-white to-slate-50/70" />
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)`,
          backgroundSize: '72px 72px'
        }} />
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-purple-400 opacity-[0.05] blur-3xl pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-red-400 opacity-[0.04] blur-2xl pointer-events-none" />

        <div className="relative container mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-[var(--border)] flex items-center justify-center flex-shrink-0 mt-1">
                <VideoIcon className="w-6 h-6 text-[var(--accent-purple)]" />
              </div>
              <div>
                <h1 className="headline-xl mb-1">
                  Hindi Video Generator: <span className="gradient-text">Vernacular Explanation</span>
                </h1>
                <p className="body text-[var(--text-secondary)]">
                  Pick a topic — AI fetches live news &amp; generates a Hindi explainer video
                </p>
              </div>
            </div>
            {videoProgress === 100 && (
              <div className="badge badge-green px-4 py-2 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Generated
              </div>
            )}
          </div>

          {/* Topic Search */}
          <form onSubmit={handleCustomSearch} className="mb-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  placeholder="Custom topic... e.g. Adani ports, Rupee depreciation"
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent-purple)] transition-colors"
                />
                {customInput && (
                  <button type="button" onClick={() => setCustomInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button type="submit" className="px-4 py-2.5 bg-[var(--accent-purple)] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                Set Topic
              </button>
            </div>
          </form>

          {/* Topic Chips */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-[var(--text-muted)] font-medium self-center mr-1">Quick pick:</span>
            {VIDEO_TOPICS.map(t => (
              <button
                key={t.label}
                onClick={() => handleTopicChip(t.label, t.query)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  activeLabel === t.label
                    ? 'bg-[var(--accent-purple)] text-white border-[var(--accent-purple)]'
                    : 'bg-white border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-purple)] hover:text-[var(--accent-purple)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        <div className="grid lg:grid-cols-2 gap-8">

          {/* ── Left: Controls + Audio result + Scripts ── */}
          <div className="space-y-6">

            {/* Generate Card */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <VideoIcon className="w-5 h-5 text-[var(--accent-purple)]" />
                </div>
                <div>
                  <h2 className="headline-md">Generate</h2>
                  <p className="caption text-[var(--text-tertiary)] truncate max-w-[260px]" title={selectedTopic}>Topic: {activeLabel}</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {/* Video button + progress */}
                <div>
                  <button
                    onClick={generateVideo}
                    disabled={generating || audioLoading}
                    className="btn btn-primary w-full disabled:opacity-50 mb-3"
                  >
                    {generating
                      ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating Video…</>
                      : <><Play className="w-5 h-5" /> Generate Hindi Video</>
                    }
                  </button>
                  {(generating || videoProgress > 0) && (
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-[var(--text-muted)]">{videoPhase}</span>
                        <span className="text-xs font-bold text-[var(--accent-purple)]">{videoProgress}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-purple-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${videoProgress}%`,
                            background: videoProgress === 100
                              ? 'var(--accent-green)'
                              : 'var(--accent-purple)'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative flex items-center gap-2">
                  <div className="flex-1 h-px bg-[var(--border)]" />
                  <span className="text-xs text-[var(--text-muted)] font-medium">or faster</span>
                  <div className="flex-1 h-px bg-[var(--border)]" />
                </div>

                {/* Audio button + progress */}
                <div>
                  <button
                    onClick={generateAudio}
                    disabled={audioLoading || generating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-[var(--accent-purple)] text-[var(--accent-purple)] font-semibold text-sm hover:bg-purple-50 disabled:opacity-50 transition-colors mb-3"
                  >
                    {audioLoading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating Audio…</>
                      : <><Headphones className="w-4 h-4" /> 🎧 Audio Summary (faster)</>
                    }
                  </button>
                  {(audioLoading || audioProgress > 0) && (
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-[var(--text-muted)]">{audioPhase}</span>
                        <span className="text-xs font-bold text-[var(--accent-purple)]">{audioProgress}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-purple-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${audioProgress}%`,
                            background: audioProgress === 100
                              ? 'var(--accent-green)'
                              : 'var(--accent-purple)'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Audio Result */}
            {(audioData || audioError) && (
              <div className="card p-6 border-l-4 border-[var(--accent-purple)]">
                <div className="flex items-center gap-2 mb-4">
                  <Volume2 className="w-5 h-5 text-[var(--accent-purple)]" />
                  <h3 className="headline-md">Audio Summary</h3>
                  {audioData?.source && (
                    <span className="ml-auto text-xs text-[var(--text-muted)] truncate max-w-[160px]">{audioData.source}</span>
                  )}
                </div>
                {audioError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-600">{audioError}</p>
                  </div>
                )}
                {audioJobId && (
                  <div className="mb-4">
                    <p className="text-xs text-[var(--text-muted)] mb-2 font-medium">Hindi Audio (TTS)</p>
                    <audio controls autoPlay className="w-full" src={`/api/audio/download/${audioJobId}`} />
                  </div>
                )}
                {audioData?.hinglish_script && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-[var(--text-secondary)] mb-1 uppercase tracking-wide">Hinglish Script</p>
                    <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border)]">
                      <p className="text-sm leading-relaxed whitespace-pre-line">{audioData.hinglish_script}</p>
                    </div>
                  </div>
                )}
                {audioData?.hindi_script && (
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-secondary)] mb-1 uppercase tracking-wide">Hindi Script</p>
                    <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border)]">
                      <p className="text-sm leading-relaxed whitespace-pre-line" style={{ fontFamily: 'var(--font-devanagari)' }}>{audioData.hindi_script}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Video Scripts */}
            {videoData && (
              <div className="space-y-4">
                <div className="card p-5">
                  <h3 className="headline-sm mb-3">English Script (Hinglish)</h3>
                  <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
                    <p className="body whitespace-pre-line leading-relaxed">{videoData.hinglish_script}</p>
                  </div>
                </div>
                <div className="card p-5">
                  <h3 className="headline-sm mb-3">Hindi Script (Devanagari)</h3>
                  <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
                    <p className="body whitespace-pre-line leading-relaxed" style={{ fontFamily: 'var(--font-devanagari)' }}>{videoData.hindi_script}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Video Player ── */}
          <div>
            <div className="card p-6 flex flex-col min-h-[420px]">
              <div className="flex items-center gap-3 mb-6">
                <VideoIcon className="w-5 h-5 text-[var(--accent-purple)]" />
                <h2 className="headline-md">Generated Video</h2>
              </div>

              {/* Idle placeholder */}
              {!generating && !videoData && (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center mb-5">
                    <VideoIcon className="w-10 h-10 text-purple-200" />
                  </div>
                  <p className="headline-sm text-[var(--text-secondary)] mb-1">No video yet</p>
                  <p className="body text-[var(--text-muted)]">Click "Generate Hindi Video" to start</p>
                </div>
              )}

              {/* Generating — big progress indicator */}
              {generating && (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                  <div className="relative w-24 h-24 mb-6">
                    <div className="w-24 h-24 rounded-full bg-purple-50 flex items-center justify-center">
                      <VideoIcon className="w-12 h-12 text-[var(--accent-purple)]" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-4 border-[var(--accent-purple)] border-t-transparent animate-spin" />
                  </div>
                  <p className="headline-sm text-[var(--accent-purple)] mb-2">{videoPhase}</p>
                  <p className="text-4xl font-bold text-[var(--accent-purple)] mb-5">{videoProgress}%</p>
                  <div className="w-56 h-3 bg-purple-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent-purple)] rounded-full transition-all duration-500"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Video ready */}
              {jobId && videoData?.video_path && (
                <div>
                  <video
                    controls
                    autoPlay
                    className="w-full rounded-lg border border-[var(--border)] mb-3"
                    src={`/api/video/download/${jobId}`}
                  />
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <CheckCircle className="w-4 h-4 text-[var(--accent-green)]" />
                    Video generated successfully
                  </div>
                </div>
              )}

              {/* Assembly failed */}
              {videoData && !videoData.video_path && !generating && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-2">
                  <p className="text-sm text-amber-700 font-medium">Video assembly failed — ffmpeg/codec issue on server.</p>
                  <p className="text-xs text-amber-600 mt-1">Scripts and audio were generated. Try 🎧 Audio Summary instead.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}

export default function VideoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>}>
      <VideoContent />
    </Suspense>
  )
}
