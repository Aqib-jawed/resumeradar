'use client'

import { useRouter } from 'next/navigation'
import { TrendingUp, ExternalLink, Calendar } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'

interface Scan {
  id:          string
  jobTitle:    string
  companyName: string
  companyType: string
  atsScore:    number | null
  status:      string
  createdAt:   string
}

export default function ScansClient({ scans }: { scans: Scan[] }) {
  const router = useRouter()

  const chartData = scans.map((s, i) => ({
    name:  `Scan ${i + 1}`,
    score: s.atsScore ?? 0,
    label: `${s.jobTitle} @ ${s.companyName}`,
  }))

  const firstScore = scans[0]?.atsScore ?? 0
  const lastScore  = scans[scans.length - 1]?.atsScore ?? 0
  const improvement = lastScore - firstScore
  const best = Math.max(...scans.map(s => s.atsScore ?? 0))

  function scoreColor(score: number) {
    if (score >= 70) return '#C8F135'
    if (score >= 45) return '#F59E0B'
    return '#FF4D4D'
  }

  return (
    <div className="min-h-screen bg-[#111111] p-6 md:p-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[rgba(200,241,53,0.08)] border border-[rgba(200,241,53,0.15)] flex items-center justify-center">
            <TrendingUp size={20} className="text-[#C8F135]"/>
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">My Scans</h1>
            <p className="text-xs text-[#555555] mt-0.5">Track your ATS score improvement over time</p>
          </div>
        </div>

        {scans.length === 0 ? (
          <div className="bg-[#161616] border border-[rgba(255,255,255,0.06)] rounded-2xl p-12 text-center">
            <p className="text-white font-bold mb-2">No completed scans yet</p>
            <p className="text-xs text-[#555555] mb-4">Run your first scan to start tracking progress</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-[#C8F135] text-[#111] font-black text-sm rounded-lg hover:bg-[#d4f54a] transition-colors"
            >
              Run first scan →
            </button>
          </div>
        ) : (
          <div className="space-y-5">

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total scans',  val: scans.length,                         mono: true  },
                { label: 'Best score',   val: best,                                 mono: true  },
                { label: 'Latest score', val: lastScore,                             mono: true  },
                { label: 'Improvement',  val: `${improvement >= 0 ? '+' : ''}${improvement} pts`, mono: true },
              ].map(({ label, val, mono }) => (
                <div key={label} className="bg-[#161616] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
                  <p className="text-xs text-[#444444] font-mono uppercase tracking-wider mb-1">{label}</p>
                  <p className={`text-2xl font-black ${mono ? 'font-mono' : ''} ${
                    label === 'Improvement'
                      ? improvement >= 0 ? 'text-[#C8F135]' : 'text-[#FF4D4D]'
                      : 'text-white'
                  }`}>{val}</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            {scans.length > 1 && (
              <div className="bg-[#161616] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
                <p className="text-xs font-mono text-[#444444] uppercase tracking-widest mb-5">Score timeline</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#444444', fontFamily: 'monospace' }} axisLine={false} tickLine={false}/>
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#444444', fontFamily: 'monospace' }} axisLine={false} tickLine={false}/>
                    <ReferenceLine y={70} stroke="rgba(200,241,53,0.2)" strokeDasharray="4 4" label={{ value: 'ATS pass', fill: '#555555', fontSize: 10 }}/>
                    <Tooltip
                      contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: '#888888' }}
                      formatter={(val: any, _: any, props: any) => [
                        <span style={{ color: '#C8F135', fontWeight: 700 }}>{val}</span>,
                        props.payload.label,
                      ]}
                    />
                    <Line
                      type="monotone" dataKey="score"
                      stroke="#C8F135" strokeWidth={2}
                      dot={{ fill: '#C8F135', r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#C8F135' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Scan list */}
            <div className="bg-[#161616] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)]">
                <p className="text-xs font-mono text-[#444444] uppercase tracking-widest">All scans</p>
              </div>
              <div className="divide-y divide-[rgba(255,255,255,0.04)]">
                {[...scans].reverse().map((scan) => (
                  <button
                    key={scan.id}
                    onClick={() => router.push(`/dashboard/results/${scan.id}`)}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors text-left"
                  >
                    {/* Score badge */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${scoreColor(scan.atsScore ?? 0)}15`, border: `1px solid ${scoreColor(scan.atsScore ?? 0)}30` }}>
                      <span className="font-mono text-lg font-black" style={{ color: scoreColor(scan.atsScore ?? 0) }}>
                        {scan.atsScore ?? '—'}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{scan.jobTitle}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[#555555]">{scan.companyName}</span>
                        <span className="text-[#2a2a2a]">·</span>
                        <span className="text-[10px] font-mono text-[#444444] uppercase">{scan.companyType}</span>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Calendar size={11} className="text-[#333333]"/>
                      <span className="text-xs text-[#444444] font-mono">
                        {new Date(scan.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    <ExternalLink size={13} className="text-[#2a2a2a] flex-shrink-0"/>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}