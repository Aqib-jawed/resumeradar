import RadarAnimation from './RadarAnimation'

interface SplitLayoutProps {
  left:  React.ReactNode
  right: React.ReactNode
}

export default function SplitLayout({ left, right }: SplitLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left dark panel */}
      <div className="relative md:w-[45%] bg-dark flex flex-col justify-between p-8 md:p-12 min-h-[280px] md:min-h-screen overflow-hidden">
        <RadarAnimation />
        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-accent rounded-sm flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="3" fill="#111"/>
              <circle cx="10" cy="10" r="6.5" stroke="#111" strokeWidth="1.5" fill="none"/>
              <circle cx="10" cy="10" r="9.5" stroke="#111" strokeWidth="1" fill="none" opacity="0.5"/>
            </svg>
          </div>
          <span className="font-bold text-lg text-[var(--color-text-primary)] tracking-tight">
            Resume<span className="text-accent">Radar</span>
          </span>
        </div>
        {/* Left content */}
        <div className="relative z-10 flex-1 flex items-center">
          {left}
        </div>
        {/* Bottom tagline */}
        <div className="relative z-10">
          <p className="text-xs text-[var(--color-text-muted)] font-mono">
            Built for the Indian job market
          </p>
        </div>
      </div>

      {/* Right light panel */}
      <div className="md:w-[55%] bg-surface flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[420px]">
          {right}
        </div>
      </div>
    </div>
  )
}