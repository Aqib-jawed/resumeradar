'use client'

import { useState } from 'react'
import { Ghost, Zap, AlertTriangle, Target, TrendingUp, ChevronDown } from 'lucide-react'

interface GhostProfile {
  roleTitle:     string
  companySignals: string
  idealProfile: {
    mustHaveSkills:    string[]
    niceToHaveSkills:  string[]
    experienceLevel:   string
    educationExpected: string
    keyPhrases:        string[]
    avoidPhrases:      string[]
  }
  redFlags:       string[]
  cultureSignals: { workStyle: string; pace: string; values: string[] }
  salaryEstimate: { range: string; basis: string }
  topTips:        string[]
}

export default function GhostModePage() {
  const [jd,       setJd]       = useState('')
  const [loading,  setLoading]  = useState(false)
  const [profile,  setProfile]  = useState<GhostProfile | null>(null)
  const [error,    setError]    = useState('')

  async function analyse() {
    if (jd.length < 50) { setError('Please paste the full job description'); return }
    setLoading(true)
    setError('')

    try {
      const res  = await fetch('/api/ghost-mode', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ jobDescription: jd }),
      })
      const json = await res.json()
      if (!json.success) { setError(json.error); return }
      setProfile(json.data)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#111111] p-6 md:p-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[rgba(200,241,53,0.08)] border border-[rgba(200,241,53,0.15)] flex items-center justify-center">
            <Ghost size={20} className="text-[#C8F135]"/>
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Ghost Mode</h1>
            <p className="text-xs text-[#555555] mt-0.5">
              Paste any JD — see the ideal candidate profile the company is hunting for
            </p>
          </div>
        </div>

        {/* Input */}
        {!profile && (
          <div className="bg-[#161616] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#555555] uppercase tracking-wider font-mono">
                Job Description
              </label>
              <textarea
                rows={10}
                value={jd}
                onChange={e => setJd(e.target.value)}
                placeholder="Paste the full job description here — no resume needed. Ghost Mode will reverse-engineer the perfect candidate profile..."
                className="w-full px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111111] text-sm text-white placeholder:text-[#2a2a2a] resize-none focus:outline-none focus:border-[rgba(255,255,255,0.15)] transition-colors"
              />
              <div className="flex justify-between">
                <span className="text-xs text-[#333333] font-mono">{jd.length} chars</span>
                {jd.length > 0 && jd.length < 50 && (
                  <span className="text-xs text-[#F59E0B]">Need at least 50 characters</span>
                )}
              </div>
            </div>

            {error && (
              <p className="text-xs text-[#FF4D4D] flex items-center gap-1.5">
                <AlertTriangle size={12}/>{error}
              </p>
            )}

            <button
              onClick={analyse}
              disabled={loading || jd.length < 50}
              className="w-full py-3.5 bg-[#C8F135] text-[#111] font-black text-sm rounded-xl hover:bg-[#d4f54a] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-[#111] border-t-transparent rounded-full animate-spin"/>Analysing JD...</>
                : <><Ghost size={16}/>Reveal the ghost profile →</>
              }
            </button>
          </div>
        )}

        {/* Results */}
        {profile && (
          <div className="space-y-4">
            {/* Reset button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">{profile.roleTitle}</h2>
                <p className="text-xs text-[#555555] mt-0.5">{profile.companySignals}</p>
              </div>
              <button
                onClick={() => { setProfile(null); setJd('') }}
                className="text-xs text-[#444444] hover:text-white border border-[rgba(255,255,255,0.06)] px-3 py-1.5 rounded-lg transition-colors"
              >
                ← New analysis
              </button>
            </div>

            {/* Salary + Culture row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#161616] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
                <p className="text-xs font-mono text-[#444444] uppercase tracking-widest mb-3">Salary estimate</p>
                <p className="text-3xl font-black text-[#C8F135] font-mono">{profile.salaryEstimate?.range}</p>
                <p className="text-xs text-[#555555] mt-2 leading-relaxed">{profile.salaryEstimate?.basis}</p>
              </div>
              <div className="bg-[#161616] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
                <p className="text-xs font-mono text-[#444444] uppercase tracking-widest mb-3">Culture signals</p>
                <p className="text-sm font-bold text-white mb-1">{profile.cultureSignals?.pace}</p>
                <p className="text-xs text-[#555555] mb-3">{profile.cultureSignals?.workStyle}</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.cultureSignals?.values?.map((v, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#666666]">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Must-have skills */}
            <div className="bg-[#161616] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target size={14} className="text-[#C8F135]"/>
                <p className="text-xs font-mono text-[#444444] uppercase tracking-widest">Must-have skills</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.idealProfile?.mustHaveSkills?.map((sk, i) => (
                  <span key={i} className="text-xs font-mono px-3 py-1.5 rounded-full bg-[rgba(200,241,53,0.08)] border border-[rgba(200,241,53,0.2)] text-[#C8F135]">
                    {sk}
                  </span>
                ))}
              </div>
              {(profile.idealProfile?.niceToHaveSkills?.length ?? 0) > 0 && (
                <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.04)]">
                  <p className="text-[10px] font-mono text-[#444444] uppercase tracking-wider mb-2">Nice to have</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.idealProfile.niceToHaveSkills.map((sk, i) => (
                      <span key={i} className="text-xs font-mono px-2.5 py-1 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-[#666666]">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Key phrases + Avoid phrases */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#161616] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
                <p className="text-xs font-mono text-[#22C55E] uppercase tracking-widest mb-3">Phrases to include</p>
                <ul className="space-y-2">
                  {profile.idealProfile?.keyPhrases?.map((p, i) => (
                    <li key={i} className="text-xs text-[#888888] flex items-start gap-2">
                      <span className="text-[#22C55E] flex-shrink-0">✓</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#161616] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
                <p className="text-xs font-mono text-[#FF4D4D] uppercase tracking-widest mb-3">Phrases to avoid</p>
                <ul className="space-y-2">
                  {profile.idealProfile?.avoidPhrases?.map((p, i) => (
                    <li key={i} className="text-xs text-[#888888] flex items-start gap-2">
                      <span className="text-[#FF4D4D] flex-shrink-0">✗</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Red flags */}
            <div className="bg-[rgba(255,77,77,0.05)] border border-[rgba(255,77,77,0.15)] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={14} className="text-[#FF4D4D]"/>
                <p className="text-xs font-mono text-[#FF4D4D] uppercase tracking-widest">Instant rejection triggers</p>
              </div>
              <ul className="space-y-2">
                {profile.redFlags?.map((flag, i) => (
                  <li key={i} className="text-xs text-[rgba(255,77,77,0.8)] flex items-start gap-2">
                    <span className="flex-shrink-0 mt-0.5">⚠</span>{flag}
                  </li>
                ))}
              </ul>
            </div>

            {/* Top tips */}
            <div className="bg-[#161616] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={14} className="text-[#C8F135]"/>
                <p className="text-xs font-mono text-[#444444] uppercase tracking-widest">Top 5 tips to tailor your resume</p>
              </div>
              <ol className="space-y-3">
                {profile.topTips?.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[rgba(200,241,53,0.08)] border border-[rgba(200,241,53,0.15)] text-[#C8F135] text-[10px] font-mono font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-[#888888] leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Experience + Education expected */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#161616] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
                <p className="text-xs font-mono text-[#444444] uppercase tracking-widest mb-2">Experience expected</p>
                <p className="text-2xl font-black text-white">{profile.idealProfile?.experienceLevel}</p>
              </div>
              <div className="bg-[#161616] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
                <p className="text-xs font-mono text-[#444444] uppercase tracking-widest mb-2">Education expected</p>
                <p className="text-sm font-semibold text-white leading-relaxed">{profile.idealProfile?.educationExpected}</p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}