'use client'

import { useState } from 'react'
import { FileCode2, AlertTriangle, CheckCircle2, XCircle, TrendingUp } from 'lucide-react'

interface DecodedJD {
  realRequirements: { requirement: string; type: string; reason: string }[]
  hiddenSignals:    string[]
  redFlags:         { flag: string; severity: string; explanation: string }[]
  salaryEstimate:   { range: string; level: string; basis: string }
  cultureDecoded:   { actualWorkStyle: string; growthPotential: string; techDebtLevel: string; teamSize: string }
  applyOrNot:       { verdict: string; reasons: string[] }
}

export default function JDDecoderPage() {
  const [jd,      setJd]      = useState('')
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState<DecodedJD | null>(null)
  const [error,   setError]   = useState('')

  async function decode() {
    if (jd.length < 50) { setError('Please paste the full job description'); return }
    setLoading(true)
    setError('')
    try {
      const res  = await fetch('/api/jd-decoder', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ jobDescription: jd }),
      })
      const json = await res.json()
      if (!json.success) { setError(json.error); return }
      setResult(json.data)
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const verdictConfig = (v: string) => {
    if (v === 'Strong Yes') return { color: '#C8F135', bg: 'rgba(200,241,53,0.1)', border: 'rgba(200,241,53,0.25)' }
    if (v === 'Yes')        return { color: '#22C55E', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.25)'  }
    if (v === 'Maybe')      return { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' }
    return                         { color: '#FF4D4D', bg: 'rgba(255,77,77,0.1)',  border: 'rgba(255,77,77,0.25)'  }
  }

  const typeConfig = (t: string) => {
    if (t === 'MUST_HAVE')  return { color: '#FF4D4D', label: 'Must have' }
    if (t === 'PREFERRED')  return { color: '#F59E0B', label: 'Preferred' }
    return                         { color: '#555555', label: 'Filler'    }
  }

  return (
    <div className="min-h-screen bg-[#111111] p-6 md:p-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[rgba(200,241,53,0.08)] border border-[rgba(200,241,53,0.15)] flex items-center justify-center">
            <FileCode2 size={20} className="text-[#C8F135]"/>
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">JD Decoder</h1>
            <p className="text-xs text-[#555555] mt-0.5">Separate real requirements from filler. Detect red flags. Decode culture.</p>
          </div>
        </div>

        {/* Input */}
        {!result && (
          <div className="bg-[#161616] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 space-y-4">
            <textarea
              rows={10}
              value={jd}
              onChange={e => setJd(e.target.value)}
              placeholder="Paste any job description here — we'll tell you what's real, what's filler, and whether to apply..."
              className="w-full px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111111] text-sm text-white placeholder:text-[#2a2a2a] resize-none focus:outline-none focus:border-[rgba(255,255,255,0.15)] transition-colors"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#333333] font-mono">{jd.length} chars</span>
              {error && <p className="text-xs text-[#FF4D4D]">{error}</p>}
            </div>
            <button
              onClick={decode}
              disabled={loading || jd.length < 50}
              className="w-full py-3.5 bg-[#C8F135] text-[#111] font-black text-sm rounded-xl hover:bg-[#d4f54a] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-[#111] border-t-transparent rounded-full animate-spin"/>Decoding JD...</>
                : <><FileCode2 size={16}/>Decode this JD →</>
              }
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">

            <div className="flex items-center justify-between">
              <p className="text-sm text-[#555555]">Decoded successfully</p>
              <button
                onClick={() => { setResult(null); setJd('') }}
                className="text-xs text-[#444444] hover:text-white border border-[rgba(255,255,255,0.06)] px-3 py-1.5 rounded-lg transition-colors"
              >
                ← Decode another
              </button>
            </div>

            {/* Apply or not verdict */}
            {result.applyOrNot && (() => {
              const vc = verdictConfig(result.applyOrNot.verdict)
              return (
                <div className="rounded-2xl p-6 border" style={{ background: vc.bg, borderColor: vc.border }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-mono uppercase tracking-widest" style={{ color: vc.color }}>Our verdict</p>
                    <span className="text-2xl font-black font-mono" style={{ color: vc.color }}>
                      {result.applyOrNot.verdict}
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {result.applyOrNot.reasons?.map((r, i) => (
                      <li key={i} className="text-xs flex items-start gap-2" style={{ color: vc.color, opacity: 0.8 }}>
                        <span className="flex-shrink-0">→</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })()}

            {/* Salary + Culture */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#161616] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
                <p className="text-xs font-mono text-[#444444] uppercase tracking-widest mb-2">Salary estimate</p>
                <p className="text-3xl font-black text-[#C8F135] font-mono">{result.salaryEstimate?.range}</p>
                <p className="text-xs text-[#555555] mt-1">{result.salaryEstimate?.level} level</p>
                <p className="text-xs text-[#444444] mt-2 leading-relaxed">{result.salaryEstimate?.basis}</p>
              </div>
              <div className="bg-[#161616] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 space-y-3">
                <p className="text-xs font-mono text-[#444444] uppercase tracking-widest">Culture decoded</p>
                <p className="text-xs text-[#888888] leading-relaxed">{result.cultureDecoded?.actualWorkStyle}</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Growth',   val: result.cultureDecoded?.growthPotential },
                    { label: 'Tech debt',val: result.cultureDecoded?.techDebtLevel },
                    { label: 'Team',     val: result.cultureDecoded?.teamSize },
                  ].map(({ label, val }) => (
                    <div key={label} className="bg-[#111111] rounded-lg p-2 text-center">
                      <p className="text-[9px] text-[#444444] font-mono uppercase">{label}</p>
                      <p className="text-xs font-bold text-white mt-0.5">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Real requirements */}
            <div className="bg-[#161616] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)]">
                <p className="text-xs font-mono text-[#444444] uppercase tracking-widest">Requirements decoded</p>
              </div>
              <div className="divide-y divide-[rgba(255,255,255,0.04)]">
                {result.realRequirements?.map((req, i) => {
                  const tc = typeConfig(req.type)
                  return (
                    <div key={i} className="flex items-start gap-4 px-6 py-4">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded flex-shrink-0 mt-0.5"
                        style={{ color: tc.color, background: `${tc.color}18` }}>
                        {tc.label}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">{req.requirement}</p>
                        <p className="text-xs text-[#555555] mt-0.5 leading-relaxed">{req.reason}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Hidden signals */}
            <div className="bg-[#161616] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
              <p className="text-xs font-mono text-[#444444] uppercase tracking-widest mb-3">Hidden signals</p>
              <ul className="space-y-2">
                {result.hiddenSignals?.map((s, i) => (
                  <li key={i} className="text-xs text-[#888888] flex items-start gap-2">
                    <span className="text-[#C8F135] flex-shrink-0 mt-0.5">◈</span>{s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Red flags */}
            {(result.redFlags?.length ?? 0) > 0 && (
              <div className="bg-[rgba(255,77,77,0.04)] border border-[rgba(255,77,77,0.15)] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={13} className="text-[#FF4D4D]"/>
                  <p className="text-xs font-mono text-[#FF4D4D] uppercase tracking-widest">Red flags</p>
                </div>
                <div className="space-y-3">
                  {result.redFlags.map((rf, i) => (
                    <div key={i}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          rf.severity === 'HIGH'   ? 'bg-[rgba(255,77,77,0.15)] text-[#FF4D4D]' :
                          rf.severity === 'MEDIUM' ? 'bg-[rgba(245,158,11,0.15)] text-[#F59E0B]' :
                                                     'bg-[rgba(255,255,255,0.05)] text-[#555555]'
                        }`}>{rf.severity}</span>
                        <p className="text-sm text-white font-medium">{rf.flag}</p>
                      </div>
                      <p className="text-xs text-[rgba(255,77,77,0.6)] pl-12 leading-relaxed">{rf.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}