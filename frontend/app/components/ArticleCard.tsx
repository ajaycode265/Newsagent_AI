'use client'

interface ArticleCardProps {
  article: {
    id: string
    headline: string
    body?: string
    source?: string
    publish_time?: string
    tags?: string[]
    entities?: string[]
    importance_score?: number
    persona_score?: number
    rewritten_headline?: string
    original_headline?: string
  }
  persona?: 'cfo' | 'first_gen'
  showScore?: boolean
  onClick?: () => void
}

export default function ArticleCard({ article, persona, showScore = true, onClick }: ArticleCardProps) {
  const score = article.persona_score || article.importance_score || 0
  const displayHeadline = article.rewritten_headline || article.headline
  const isRewritten = !!article.rewritten_headline
  
  const getCategoryTag = () => {
    if (article.tags && article.tags.length > 0) {
      return article.tags[0].toUpperCase()
    }
    if (article.entities && article.entities.length > 0) {
      const entity = article.entities[0]
      if (entity.includes('RBI') || entity.includes('policy')) return 'POLICY'
      if (entity.includes('market') || entity.includes('stock')) return 'MARKET'
      if (entity.includes('sector')) return 'SECTOR'
    }
    return persona === 'first_gen' ? 'LEARN' : 'MACRO'
  }
  
  const getCategoryColor = (tag: string) => {
    const colors: Record<string, string> = {
      'MACRO': 'bg-blue-600',
      'POLICY': 'bg-purple-600',
      'MARKET': 'bg-amber-600',
      'SECTOR': 'bg-green-600',
      'LEARN': 'bg-emerald-600'
    }
    return colors[tag] || 'bg-gray-600'
  }
  
  const category = getCategoryTag()
  const readTime = Math.ceil((article.body?.length || 500) / 1000)
  
  return (
    <div 
      className="card-hover bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 cursor-pointer relative overflow-hidden"
      onClick={onClick}
    >
      {/* Top section: Tag and Score */}
      <div className="flex items-start justify-between mb-3">
        <span className={`${getCategoryColor(category)} text-white text-xs font-medium px-2 py-1 rounded`}>
          {category}
        </span>
        
        {showScore && (
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="var(--border-active)"
                  strokeWidth="3"
                  fill="none"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="var(--accent-amber)"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${(score / 100) * 100.5} 100.5`}
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                {Math.round(score)}
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Headline */}
      <h3 className="headline-md text-[var(--text-primary)] mb-3 line-clamp-2">
        {displayHeadline}
      </h3>
      
      {/* Metadata */}
      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-3">
        <span>{article.source || 'ET Bureau'}</span>
        <span>·</span>
        <span>{article.publish_time || '2h ago'}</span>
        <span>·</span>
        <span>⏱ {readTime} min read</span>
      </div>
      
      {/* Entity pills */}
      {article.entities && article.entities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {article.entities.slice(0, 3).map((entity, idx) => (
            <span 
              key={idx}
              className="text-xs bg-[var(--bg-elevated)] text-[var(--text-secondary)] px-2 py-1 rounded-full border border-[var(--border)]"
            >
              {entity}
            </span>
          ))}
        </div>
      )}
      
      {/* Rewritten indicator */}
      {isRewritten && article.original_headline && (
        <div className="mt-3 pt-3 border-t border-[var(--border)]">
          <button 
            className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-amber)] transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              alert(`Original: ${article.original_headline}`)
            }}
          >
            View original headline ↗
          </button>
        </div>
      )}
      
      {/* Hover border effect */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-amber)] opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}

export function ArticleCardSkeleton() {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="skeleton h-6 w-20 rounded" />
        <div className="skeleton h-10 w-10 rounded-full" />
      </div>
      <div className="skeleton h-12 w-full rounded mb-3" />
      <div className="flex gap-2 mb-3">
        <div className="skeleton h-4 w-16 rounded" />
        <div className="skeleton h-4 w-12 rounded" />
        <div className="skeleton h-4 w-16 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-6 w-20 rounded-full" />
        <div className="skeleton h-6 w-24 rounded-full" />
      </div>
    </div>
  )
}
