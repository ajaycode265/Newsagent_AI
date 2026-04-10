import { Radio } from 'lucide-react'

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

export default function NewsTicker() {
  return (
    <div className="bg-[var(--primary)] overflow-hidden">
      <div className="flex items-stretch">
        <div className="flex-shrink-0 flex items-center gap-2 bg-[var(--primary-dark)] px-4 py-2">
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
  )
}
