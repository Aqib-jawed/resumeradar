'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GLOBAL ERROR]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-sm">
        <div className="w-14 h-14 rounded-full bg-[rgba(255,77,77,0.1)] border border-[rgba(255,77,77,0.2)] flex items-center justify-center mx-auto">
          <AlertTriangle size={24} className="text-[#FF4D4D]" />
        </div>

        <div>
          <p className="text-white font-black text-lg">
            Something went wrong
          </p>

          <p className="text-xs text-[#555555] mt-1 leading-relaxed">
            An unexpected error occurred. Your data is safe.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-4 py-2.5 bg-[#C8F135] text-[#111] font-black text-sm rounded-xl hover:bg-[#d4f54a] transition-colors"
          >
            Try again
          </button>

          <Link
            href="/dashboard"
            className="px-4 py-2.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.06)] text-white font-semibold text-sm rounded-xl hover:bg-[#222] transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}