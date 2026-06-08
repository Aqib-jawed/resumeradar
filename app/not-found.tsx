import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full border-2 border-[rgba(200,241,53,0.3)] flex items-center justify-center mx-auto">
          <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="2.5" fill="#C8F135" opacity="0.4"/>
            <circle cx="10" cy="10" r="6"   stroke="#C8F135" strokeWidth="1.5" fill="none" opacity="0.3"/>
            <circle cx="10" cy="10" r="9"   stroke="#C8F135" strokeWidth="1"   fill="none" opacity="0.15"/>
          </svg>
        </div>
        <div>
          <p className="text-6xl font-black text-white font-mono">404</p>
          <p className="text-sm text-[#555555] mt-2">This page doesn't exist</p>
        </div>
        <Link href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C8F135] text-[#111] font-black text-sm rounded-xl hover:bg-[#d4f54a] transition-colors">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  )
}