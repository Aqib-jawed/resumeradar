'use client'

export default function RadarAnimation({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      <svg
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        width="600" height="600" viewBox="0 0 600 600"
      >
        {[60, 110, 165, 225, 290].map((r, i) => (
          <circle key={r} cx="300" cy="300" r={r}
            fill="none" stroke="#C8F135" strokeWidth="0.8"
            opacity={0.06 - i * 0.005}
          />
        ))}
        {[[300,10],[559,159],[559,441],[41,441],[41,159]].map(([x,y], i) => (
          <line key={i} x1="300" y1="300" x2={x} y2={y}
            stroke="#C8F135" strokeWidth="0.4" opacity="0.04"
          />
        ))}
        {[0, 1, 2].map((i) => (
          <circle key={i} cx="300" cy="300" r="220"
            fill="none" stroke="#C8F135" strokeWidth="1"
            style={{
              animation: `radarPing 3s ease-out ${i}s infinite`,
              opacity: 0,
              transformOrigin: '300px 300px',
            }}
          />
        ))}
      </svg>
      <style>{`
        @keyframes radarPing {
          0%   { transform: scale(0.2); opacity: 0.5; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </div>
  )
}