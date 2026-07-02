'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check, Crown, Zap, X, Loader2 } from 'lucide-react'

const FEATURES = [
  { name: 'ATS Resume Scan',          free: '3 / month',  pro: 'Unlimited'   },
  { name: 'Score Breakdown',          free: true,          pro: true           },
  { name: 'Section-by-Section Grades', free: true,         pro: true           },
  { name: 'Keyword Gap Analysis',     free: true,          pro: true           },
  { name: 'India-Specific Warnings',  free: true,          pro: true           },
  { name: 'Roast Mode',               free: true,          pro: true           },
  { name: 'Ghost Mode',               free: true,          pro: true           },
  { name: 'JD Decoder',               free: true,          pro: true           },
  { name: 'Interview Prep',           free: true,          pro: true           },
  { name: 'Score Timeline',           free: true,          pro: true           },
  { name: 'AI-Rewritten Resume (PDF)', free: false,        pro: true           },
  { name: 'JD Auto-Import (URL)',     free: false,          pro: true           },
  { name: 'Shareable Reports',        free: true,          pro: true           },
  { name: 'Priority Processing',      free: false,          pro: true           },
]

export default function UpgradePage() {
  const searchParams = useSearchParams()
  const success      = searchParams.get('success') === 'true'
  const canceled     = searchParams.get('canceled') === 'true'

  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [loading,  setLoading]  = useState(false)

  async function handleCheckout() {
    setLoading(true)
    try {
      const res  = await fetch('/api/stripe/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ interval }),
      })
      const json = await res.json()
      if (json.success && json.data.url) {
        window.location.href = json.data.url
      } else {
        console.error('Checkout error:', json.error)
        setLoading(false)
      }
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] p-6 md:p-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[rgba(200,241,53,0.08)] border border-[rgba(200,241,53,0.15)] rounded-full mb-4">
            <Crown size={14} className="text-[#C8F135]" />
            <span className="text-xs font-semibold text-[#C8F135]">Upgrade to Pro</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Unlock your full potential
          </h1>
          <p className="text-sm text-[#6B7280] mt-2 max-w-md mx-auto">
            Get unlimited scans, AI-rewritten resumes, and every premium feature.
          </p>
        </div>

        {/* Success / Canceled banners */}
        {success && (
          <div className="mb-6 p-4 bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)] rounded-xl flex items-center gap-3">
            <Check size={18} className="text-[#22C55E] flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-[#22C55E]">You&apos;re now on Pro!</p>
              <p className="text-xs text-[#6B7280] mt-0.5">All premium features are unlocked. Happy scanning!</p>
            </div>
          </div>
        )}
        {canceled && (
          <div className="mb-6 p-4 bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] rounded-xl flex items-center gap-3">
            <X size={18} className="text-[#F59E0B] flex-shrink-0" />
            <p className="text-sm text-[#F59E0B]">Checkout canceled. No charges were made.</p>
          </div>
        )}

        {/* Interval toggle */}
        <div className="flex items-center justify-center gap-1 mb-8">
          <button
            onClick={() => setInterval('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              interval === 'monthly'
                ? 'bg-[#C8F135] text-[#111111]'
                : 'bg-[#161616] text-[#6B7280] border border-[rgba(255,255,255,0.08)] hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval('yearly')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all relative ${
              interval === 'yearly'
                ? 'bg-[#C8F135] text-[#111111]'
                : 'bg-[#161616] text-[#6B7280] border border-[rgba(255,255,255,0.08)] hover:text-white'
            }`}
          >
            Yearly
            <span className="absolute -top-2 -right-2 text-[9px] font-black bg-[#22C55E] text-white px-1.5 py-0.5 rounded-full">
              SAVE 58%
            </span>
          </button>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">

          {/* Free card */}
          <div className="bg-[#111111] border border-[rgba(255,255,255,0.07)] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} className="text-[#6B7280]" />
              <span className="text-sm font-bold text-[#9CA3AF]">Free</span>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-black text-white font-mono">₹0</span>
              <span className="text-sm text-[#4B5563] ml-1">/ forever</span>
            </div>
            <div className="space-y-3">
              {FEATURES.map(f => (
                <div key={f.name} className="flex items-center gap-3">
                  {f.free ? (
                    <Check size={14} className="text-[#6B7280] flex-shrink-0" />
                  ) : (
                    <X size={14} className="text-[#374151] flex-shrink-0" />
                  )}
                  <span className={`text-sm ${f.free ? 'text-[#9CA3AF]' : 'text-[#374151]'}`}>
                    {f.name}
                    {typeof f.free === 'string' && (
                      <span className="text-xs text-[#4B5563] ml-1.5">({f.free})</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro card */}
          <div className="relative bg-[#111111] border-2 border-[#C8F135] rounded-2xl p-6 overflow-hidden">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(200,241,53,0.04)] to-transparent pointer-events-none" />

            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Crown size={16} className="text-[#C8F135]" />
                <span className="text-sm font-bold text-[#C8F135]">Pro</span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-black text-white font-mono">
                  ₹{interval === 'monthly' ? '199' : '999'}
                </span>
                <span className="text-sm text-[#4B5563] ml-1">
                  / {interval === 'monthly' ? 'month' : 'year'}
                </span>
                {interval === 'yearly' && (
                  <span className="block text-xs text-[#22C55E] mt-1">
                    That&apos;s just ₹83/month — less than a coffee ☕
                  </span>
                )}
              </div>
              <div className="space-y-3 mb-6">
                {FEATURES.map(f => (
                  <div key={f.name} className="flex items-center gap-3">
                    <Check size={14} className="text-[#C8F135] flex-shrink-0" />
                    <span className="text-sm text-[#D1D5DB]">
                      {f.name}
                      {typeof f.pro === 'string' && (
                        <span className="text-xs text-[#C8F135] ml-1.5 font-semibold">({f.pro})</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-3.5 bg-[#C8F135] text-[#111111] font-black text-sm rounded-xl hover:bg-[#d4f54a] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Redirecting to Stripe…
                  </>
                ) : (
                  <>
                    <Crown size={14} />
                    Upgrade to Pro — ₹{interval === 'monthly' ? '199' : '999'}/{interval === 'monthly' ? 'mo' : 'yr'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-[#111111] border border-[rgba(255,255,255,0.07)] rounded-2xl p-6">
          <p className="text-xs font-mono text-[#4B5563] uppercase tracking-widest mb-4">Frequently asked</p>
          <div className="space-y-4">
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes. Cancel from your Stripe dashboard anytime. Your Pro features remain active until the end of your billing period.',
              },
              {
                q: 'What happens to my scans if I downgrade?',
                a: 'All existing scan results are preserved. You just won\'t be able to run more than 3 scans per month on the Free plan.',
              },
              {
                q: 'Is the payment secure?',
                a: 'Absolutely. All payments are processed by Stripe, a PCI-certified payment processor used by millions of businesses worldwide.',
              },
            ].map(faq => (
              <div key={faq.q}>
                <p className="text-sm font-semibold text-white">{faq.q}</p>
                <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
