'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  CheckCircle2, XCircle, AlertTriangle, ChevronDown,
  Copy, Check, Flame, Shield, ArrowLeft, TrendingUp,
  User, Briefcase, GraduationCap, Code2, Trophy, Star
} from 'lucide-react'

/* ── Types ── */
interface ScanData {
  id:             string
  status:         string
  jobTitle:       string
  companyName:    string
  companyType:    string
  atsScore:       number
  scoreBreakdown: Record<string, number>
  sectionGrades:  Record<string, number>
  keywords:       { matched: string[]; missing: string[]; bonus: string[] }
  suggestions:    Suggestion[]
  indiaFlags:     IndiaFlag[]
  roastMode:      { summary: string; bullets: string[] }
  resumeSections?: ResumeSections
}

interface ResumeSections {
  contactInfo?: { content: any;  issues: string[]; score: number }
  summary?:     { content: any;  issues: string[]; score: number }
  experience?:  { jobs: Job[];   overallIssues: string[]; score: number }
  education?:   { entries: Edu[];overallIssues: string[]; score: number }
  skills?:      { technicalSkills: string[]; softSkills: string[]; missingFromJD: string[]; irrelevant: string[]; issues: string[]; score: number }
  projects?:    { entries: Proj[];overallIssues: string[]; score: number }
  achievements?:{ content: string[]; issues: string[]; score: number }
}

interface Job  { title: string; company: string; duration: string; bullets: string[]; issues: string[]; improvements: string[] }
interface Edu  { degree: string; institution: string; year: string; score: string; issues: string[] }
interface Proj { name: string; tech: string[]; description: any; issues: string[]; improvements: string[] }
interface Suggestion { section: string; issue: string; fix: string; impact: 'HIGH'|'MEDIUM'|'LOW'; beforeText: string; afterText: string }
interface IndiaFlag  { type: string; message: string; severity: string }

/* ── Helpers ── */
function safe(val: any): string {
  if (!val) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

function atsColor(s: number) {
  if (s >= 70) return { main: '#22C55E', glow: 'rgba(34,197,94,0.15)',  label: 'Strong — likely to pass ATS'   }
  if (s >= 50) return { main: '#F59E0B', glow: 'rgba(245,158,11,0.15)', label: 'Average — may pass ATS'         }
  return              { main: '#EF4444', glow: 'rgba(239,68,68,0.15)',   label: 'Weak — likely to be filtered'   }
}

function sectionColor(s: number) {
  if (s >= 8) return { text: '#22C55E', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.2)'   }
  if (s >= 6) return { text: '#C8F135', bg: 'rgba(200,241,53,0.1)',  border: 'rgba(200,241,53,0.2)'  }
  if (s >= 4) return { text: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)'  }
  return             { text: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)'   }
}

function impactBadge(i: string) {
  if (i === 'HIGH')   return 'bg-[rgba(239,68,68,0.1)]   text-[#EF4444]  border border-[rgba(239,68,68,0.2)]'
  if (i === 'MEDIUM') return 'bg-[rgba(245,158,11,0.1)]  text-[#F59E0B]  border border-[rgba(245,158,11,0.2)]'
  return                     'bg-[rgba(255,255,255,0.05)] text-[#6B7280]  border border-[rgba(255,255,255,0.08)]'
}

const SCORE_META: Record<string, { label: string; max: number }> = {
  keywordMatch:        { label: 'Keyword match',        max: 35 },
  sectionCompleteness: { label: 'Section completeness', max: 25 },
  formattingSignals:   { label: 'Formatting',           max: 15 },
  actionVerbQuality:   { label: 'Action verbs',         max: 10 },
  quantification:      { label: 'Quantification',       max: 15 },
}

/* ── Score ring ── */
function ScoreRing({ score, animated }: { score: number; animated: boolean }) {
  const { main, glow, label } = atsColor(score)
  const r    = 56
  const circ = 2 * Math.PI * r
  const dash = animated ? circ - (score / 100) * circ : circ

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ filter: `drop-shadow(0 0 20px ${glow})` }}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
          <circle cx="70" cy="70" r={r} fill="none"
            stroke={main} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={dash}
            transform="rotate(-90 70 70)"
            style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.34,1.2,0.64,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-black font-mono leading-none" style={{ color: main }}>{score}</span>
          <span className="text-[10px] text-[#6B7280] font-mono mt-1 uppercase tracking-wider">/ 100</span>
        </div>
      </div>
      <span className="text-xs font-semibold px-3 py-1 rounded-full border" style={{
        color:            main,
        background:       glow,
        borderColor:      `${main}40`,
      }}>{label}</span>
    </div>
  )
}

/* ── Main ── */
export default function ResultsPage() {
  const params  = useParams()
  const router  = useRouter()
  const scanId  = params.scanId as string

  const [scan,     setScan]     = useState<ScanData | null>(null)
  const [status,   setStatus]   = useState('PENDING')
  const [roast,    setRoast]    = useState(false)
  const [openIdx,  setOpenIdx]  = useState<number | null>(0)
  const [copied,   setCopied]   = useState<string | null>(null)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout
    async function poll() {
      try {
        const r1 = await fetch(`/api/scan/${scanId}/status`)
        const j1 = await r1.json()
        if (!j1.success) return
        setStatus(j1.data.status)
        if (j1.data.status === 'COMPLETE') {
          const r2 = await fetch(`/api/scan/${scanId}/results`)
          const j2 = await r2.json()
          if (j2.success) { setScan(j2.data); setTimeout(() => setAnimated(true), 150) }
        } else if (j1.data.status !== 'FAILED') {
          timer = setTimeout(poll, 3000)
        }
      } catch { timer = setTimeout(poll, 5000) }
    }
    poll()
    return () => clearTimeout(timer)
  }, [scanId])

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!scan) return <ProcessingScreen status={status}/>

  const rs = scan.resumeSections

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-6">

        {/* ── Top bar ── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <button onClick={() => router.push('/dashboard')}
              className="mt-1 p-1.5 rounded-lg text-[#6B7280] hover:text-white hover:bg-white/5 transition-all">
              <ArrowLeft size={16}/>
            </button>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">{scan.jobTitle}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-[#6B7280]">{scan.companyName}</span>
                <span className="w-1 h-1 rounded-full bg-[#374151]"/>
                <span className="text-xs font-mono text-[#4B5563] uppercase tracking-wide">{scan.companyType}</span>
              </div>
            </div>
          </div>
          <button onClick={() => setRoast(r => !r)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all flex-shrink-0 ${
              roast
                ? 'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.25)] text-[#EF4444]'
                : 'bg-[#161616] border-[rgba(255,255,255,0.08)] text-[#6B7280] hover:text-white'
            }`}>
            <Flame size={13}/>{roast ? 'Roast ON' : 'Roast'}
          </button>
        </div>

        {/* ── ATS Score + Breakdown ── */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

          {/* Score ring */}
          <div className="md:col-span-2 bg-[#111111] border border-[rgba(255,255,255,0.07)] rounded-2xl p-6 flex items-center justify-center">
            <ScoreRing score={scan.atsScore} animated={animated}/>
          </div>

          {/* Breakdown */}
          <div className="md:col-span-3 bg-[#111111] border border-[rgba(255,255,255,0.07)] rounded-2xl p-6">
            <p className="text-[10px] font-mono text-[#4B5563] uppercase tracking-widest mb-4">Score breakdown</p>
            <div className="space-y-3">
              {Object.entries(scan.scoreBreakdown ?? {}).map(([key, val]) => {
                const meta = SCORE_META[key]
                const pct  = meta ? (val / meta.max) * 100 : 0
                const col  = pct >= 70 ? '#22C55E' : pct >= 45 ? '#F59E0B' : '#EF4444'
                return (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-[#9CA3AF]">{meta?.label ?? key}</span>
                      <span className="text-xs font-mono text-[#6B7280]">{val}<span className="text-[#374151]">/{meta?.max ?? 10}</span></span>
                    </div>
                    <div className="h-1.5 bg-[#1F1F1F] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{ width: animated ? `${pct}%` : '0%', background: col }}/>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Section scores (1-10) ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: 'education',  label: 'Education',  icon: <GraduationCap size={14}/> },
            { key: 'skills',     label: 'Skills',     icon: <Code2 size={14}/>          },
            { key: 'experience', label: 'Experience', icon: <Briefcase size={14}/>      },
            { key: 'projects',   label: 'Projects',   icon: <Star size={14}/>           },
          ].map(({ key, label, icon }) => {
            const raw   = scan.sectionGrades?.[key]
            const score = typeof raw === 'number' ? raw : 0
            const sc    = sectionColor(score)
            return (
              <div key={key} className="bg-[#111111] border border-[rgba(255,255,255,0.07)] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span style={{ color: sc.text }}>{icon}</span>
                    <span className="text-xs text-[#9CA3AF] font-medium">{label}</span>
                  </div>
                  <span className="text-lg font-black font-mono" style={{ color: sc.text }}>{score}</span>
                </div>
                {/* 10-dot bar */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-700"
                      style={{
                        background:   animated && i < score ? sc.text : 'rgba(255,255,255,0.06)',
                        transitionDelay: animated ? `${i * 60}ms` : '0ms',
                      }}/>
                  ))}
                </div>
                <p className="text-[10px] text-[#4B5563] mt-2 font-mono">/ 10</p>
              </div>
            )
          })}
        </div>

        {/* ── India flags ── */}
        {(scan.indiaFlags?.length ?? 0) > 0 && (
          <div className="bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.18)] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={14} className="text-[#F59E0B]"/>
              <span className="text-xs font-semibold text-[#F59E0B] uppercase tracking-widest font-mono">India-specific warnings</span>
            </div>
            {scan.indiaFlags.map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-[#D97706]">
                <AlertTriangle size={11} className="flex-shrink-0 mt-0.5"/>
                {safe(f.message)}
              </div>
            ))}
          </div>
        )}

        {/* ── Roast mode ── */}
        {roast && scan.roastMode && (
          <div className="bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.18)] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Flame size={14} className="text-[#EF4444]"/>
              <span className="text-xs font-semibold text-[#EF4444] uppercase tracking-widest font-mono">Roast mode</span>
            </div>
            <p className="text-sm text-[#FCA5A5] leading-relaxed mb-4">{safe(scan.roastMode.summary)}</p>
            <ul className="space-y-2">
              {scan.roastMode.bullets?.map((b, i) => (
                <li key={i} className="text-xs text-[#F87171] flex items-start gap-2">
                  <span className="flex-shrink-0">💀</span>{safe(b)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Keywords ── */}
        <div className="bg-[#111111] border border-[rgba(255,255,255,0.07)] rounded-2xl p-6">
          <p className="text-[10px] font-mono text-[#4B5563] uppercase tracking-widest mb-5">Keyword analysis</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Matched', count: scan.keywords?.matched?.length ?? 0, list: scan.keywords?.matched, color: '#22C55E', icon: <CheckCircle2 size={12}/> },
              { label: 'Missing', count: scan.keywords?.missing?.length ?? 0, list: scan.keywords?.missing, color: '#EF4444', icon: <XCircle size={12}/>       },
              { label: 'Bonus',   count: scan.keywords?.bonus?.length   ?? 0, list: scan.keywords?.bonus,   color: '#C8F135', icon: <TrendingUp size={12}/>    },
            ].map(({ label, count, list, color, icon }) => (
              <div key={label}>
                <div className="flex items-center gap-1.5 mb-3" style={{ color }}>
                  {icon}
                  <span className="text-xs font-semibold">{label} ({count})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {count === 0 && <span className="text-xs text-[#374151]">None</span>}
                  {list?.map(kw => (
                    <span key={kw} className="text-xs px-2.5 py-1 rounded-full font-mono border"
                      style={{ color, background: `${color}12`, borderColor: `${color}30` }}>
                      {safe(kw)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section-by-section ── */}
        {rs && (
          <div className="space-y-3">
            <p className="text-[10px] font-mono text-[#4B5563] uppercase tracking-widest">Resume — section by section</p>

            {/* Contact */}
            {rs.contactInfo && (
              <ResumeSection title="Contact Info" score={rs.contactInfo.score} issues={rs.contactInfo.issues} icon={<User size={14}/>}>
                <div className="bg-[#0D0D0D] rounded-xl px-4 py-3 border border-[rgba(255,255,255,0.05)]">
                  <p className="text-sm text-[#D1D5DB] font-mono leading-relaxed">
                    {typeof rs.contactInfo.content === 'string' && rs.contactInfo.content
                      ? rs.contactInfo.content
                      : <span className="text-[#EF4444] text-xs">Contact info not detected in PDF</span>}
                  </p>
                </div>
              </ResumeSection>
            )}

            {/* Summary */}
            {rs.summary && (
              <ResumeSection title="Summary / Objective" score={rs.summary.score} issues={rs.summary.issues} icon={<User size={14}/>}>
                <div className="bg-[#0D0D0D] rounded-xl px-4 py-4 border border-[rgba(255,255,255,0.05)]">
                  {typeof rs.summary.content === 'string' && rs.summary.content && rs.summary.content !== 'Not found'
                    ? <p className="text-sm text-[#D1D5DB] leading-relaxed italic">"{rs.summary.content}"</p>
                    : <p className="text-xs text-[#EF4444]">⚠ No summary detected — add 2-3 sentences tailored to this role</p>
                  }
                </div>
              </ResumeSection>
            )}

            {/* Experience */}
            {rs.experience && (
              <ResumeSection title="Experience" score={rs.experience.score} issues={rs.experience.overallIssues} icon={<Briefcase size={14}/>}>
                <div className="space-y-5">
                  {(rs.experience.jobs ?? []).map((job, ji) => (
                    <div key={ji} className="relative pl-4 border-l-2 border-[rgba(255,255,255,0.08)]">
                      <div className="absolute -left-1.5 top-1 w-2.5 h-2.5 rounded-full bg-[#374151] border-2 border-[#1F2937]"/>
                      <div className="mb-2">
                        <span className="text-sm font-bold text-white">{safe(job.title)}</span>
                        <span className="text-[#6B7280] mx-2">·</span>
                        <span className="text-sm text-[#9CA3AF]">{safe(job.company)}</span>
                        <span className="ml-3 text-xs font-mono text-[#4B5563]">{safe(job.duration)}</span>
                      </div>
                      {(job.bullets ?? []).length > 0 && (
                        <ul className="space-y-1.5 mb-3">
                          {job.bullets.map((b, bi) => (
                            <li key={bi} className="flex items-start gap-2 text-sm text-[#9CA3AF] leading-relaxed">
                              <span className="text-[#374151] flex-shrink-0 mt-1.5">▸</span>{safe(b)}
                            </li>
                          ))}
                        </ul>
                      )}
                      {(job.issues ?? []).length > 0 && (
                        <div className="space-y-1 mb-2">
                          {job.issues.map((iss, ii) => (
                            <p key={ii} className="text-xs text-[#D97706] flex items-start gap-1.5">
                              <AlertTriangle size={10} className="flex-shrink-0 mt-0.5"/>{safe(iss)}
                            </p>
                          ))}
                        </div>
                      )}
                      {(job.improvements ?? []).length > 0 && (
                        <div className="bg-[rgba(200,241,53,0.04)] border border-[rgba(200,241,53,0.1)] rounded-xl p-3 mt-2">
                          <p className="text-[10px] text-[#C8F135] font-mono uppercase tracking-wider mb-2">Suggested rewrites</p>
                          {job.improvements.map((imp, ii) => (
                            <p key={ii} className="text-xs text-[#A3A3A3] flex items-start gap-1.5 mb-1">
                              <span className="text-[#C8F135] flex-shrink-0">→</span>{safe(imp)}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ResumeSection>
            )}

            {/* Skills */}
            {rs.skills && (
              <ResumeSection title="Skills" score={rs.skills.score} issues={rs.skills.issues} icon={<Code2 size={14}/>}>
                <div className="space-y-4">
                  {(rs.skills.technicalSkills ?? []).length > 0 && (
                    <div>
                      <p className="text-[10px] text-[#6B7280] font-mono uppercase tracking-wider mb-2">Technical</p>
                      <div className="flex flex-wrap gap-1.5">
                        {rs.skills.technicalSkills.map(sk => (
                          <span key={sk} className="text-xs px-2.5 py-1 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#D1D5DB] rounded-lg font-mono">
                            {safe(sk)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(rs.skills.softSkills ?? []).length > 0 && (
                    <div>
                      <p className="text-[10px] text-[#6B7280] font-mono uppercase tracking-wider mb-2">Soft skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {rs.skills.softSkills.map(sk => (
                          <span key={sk} className="text-xs px-2.5 py-1 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#9CA3AF] rounded-lg font-mono">
                            {safe(sk)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(rs.skills.missingFromJD ?? []).length > 0 && (
                    <div>
                      <p className="text-[10px] text-[#EF4444] font-mono uppercase tracking-wider mb-2">Add these — missing from JD match</p>
                      <div className="flex flex-wrap gap-1.5">
                        {rs.skills.missingFromJD.map(sk => (
                          <span key={sk} className="text-xs px-2.5 py-1 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-[#FCA5A5] rounded-lg font-mono">
                            {safe(sk)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ResumeSection>
            )}

            {/* Projects */}
            {rs.projects && (
              <ResumeSection title="Projects" score={rs.projects.score} issues={rs.projects.overallIssues} icon={<Star size={14}/>}>
                <div className="space-y-5">
                  {(rs.projects.entries ?? []).map((proj, pi) => (
                    <div key={pi} className="relative pl-4 border-l-2 border-[rgba(255,255,255,0.08)]">
                      <div className="absolute -left-1.5 top-1 w-2.5 h-2.5 rounded-full bg-[#374151] border-2 border-[#1F2937]"/>
                      <p className="text-sm font-bold text-white mb-2">{safe(proj.name)}</p>
                      {(proj.tech ?? []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {proj.tech.map(t => (
                            <span key={t} className="text-[10px] font-mono px-2 py-0.5 bg-[rgba(200,241,53,0.07)] text-[#A3E635] border border-[rgba(200,241,53,0.15)] rounded-md">
                              {safe(t)}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-[#9CA3AF] leading-relaxed mb-2">{safe(proj.description)}</p>
                      {(proj.issues ?? []).length > 0 && (
                        <div className="space-y-1 mb-2">
                          {proj.issues.map((iss, ii) => (
                            <p key={ii} className="text-xs text-[#D97706] flex items-start gap-1.5">
                              <AlertTriangle size={10} className="flex-shrink-0 mt-0.5"/>{safe(iss)}
                            </p>
                          ))}
                        </div>
                      )}
                      {(proj.improvements ?? []).length > 0 && (
                        <div className="bg-[rgba(200,241,53,0.04)] border border-[rgba(200,241,53,0.1)] rounded-xl p-3">
                          <p className="text-[10px] text-[#C8F135] font-mono uppercase tracking-wider mb-2">Suggested rewrite</p>
                          {proj.improvements.map((imp, ii) => (
                            <p key={ii} className="text-xs text-[#A3A3A3] flex items-start gap-1.5">
                              <span className="text-[#C8F135] flex-shrink-0">→</span>{safe(imp)}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ResumeSection>
            )}

            {/* Education */}
            {rs.education && (
              <ResumeSection title="Education" score={rs.education.score} issues={rs.education.overallIssues} icon={<GraduationCap size={14}/>}>
                {(rs.education.entries ?? []).length === 0
                  ? <p className="text-xs text-[#EF4444]">⚠ No education entries detected — check PDF parsing</p>
                  : <div className="space-y-4">
                      {rs.education.entries.map((edu, ei) => (
                        <div key={ei} className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold text-white">{safe(edu.degree)}</p>
                            <p className="text-sm text-[#9CA3AF] mt-0.5">{safe(edu.institution)}</p>
                            <p className="text-xs font-mono text-[#6B7280] mt-0.5">{safe(edu.year)}</p>
                            {edu.score && (
                              <span className="inline-block mt-1.5 text-xs font-mono px-2 py-0.5 rounded-md bg-[rgba(200,241,53,0.08)] text-[#A3E635] border border-[rgba(200,241,53,0.15)]">
                                {safe(edu.score)}
                              </span>
                            )}
                          </div>
                          {(edu.issues ?? []).length > 0 && (
                            <div className="space-y-1 text-right flex-shrink-0">
                              {edu.issues.map((iss, ii) => (
                                <p key={ii} className="text-[10px] text-[#D97706]">{safe(iss)}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                }
              </ResumeSection>
            )}

            {/* Achievements */}
            {rs.achievements && (rs.achievements.content ?? []).length > 0 && (
              <ResumeSection title="Achievements & Leadership" score={rs.achievements.score} issues={rs.achievements.issues} icon={<Trophy size={14}/>}>
                <ul className="space-y-2">
                  {rs.achievements.content.map((ach, ai) => (
                    <li key={ai} className="flex items-start gap-2.5 text-sm text-[#9CA3AF] leading-relaxed">
                      <span className="text-[#C8F135] flex-shrink-0 mt-0.5">★</span>{safe(ach)}
                    </li>
                  ))}
                </ul>
              </ResumeSection>
            )}
          </div>
        )}

        {/* ── Fix suggestions ── */}
        <div className="bg-[#111111] border border-[rgba(255,255,255,0.07)] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)]">
            <p className="text-[10px] font-mono text-[#4B5563] uppercase tracking-widest">
              Fix suggestions ({scan.suggestions?.length ?? 0})
            </p>
          </div>
          {(scan.suggestions ?? []).map((s, i) => {
            const open = openIdx === i
            return (
              <div key={i} className="border-b border-[rgba(255,255,255,0.04)] last:border-0">
                <button
                  onClick={() => setOpenIdx(open ? null : i)}
                  className="w-full flex items-center gap-3 px-6 py-4 hover:bg-white/[0.02] transition-colors text-left">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex-shrink-0 ${impactBadge(s.impact)}`}>
                    {s.impact}
                  </span>
                  <span className="text-[10px] font-mono text-[#4B5563] flex-shrink-0 uppercase">{s.section}</span>
                  <span className="text-sm text-[#E5E7EB] flex-1 truncate">{safe(s.issue)}</span>
                  <ChevronDown size={14} className={`text-[#374151] flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}/>
                </button>
                {open && (
                  <div className="px-6 pb-6 space-y-3 border-t border-[rgba(255,255,255,0.04)]">
                    <div className="bg-[rgba(200,241,53,0.05)] border border-[rgba(200,241,53,0.12)] rounded-xl p-4 mt-4">
                      <p className="text-[10px] text-[#C8F135] font-mono uppercase tracking-wider mb-1.5">✓ Fix</p>
                      <p className="text-sm text-[#D1D5DB] leading-relaxed">{safe(s.fix)}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.12)] rounded-xl p-4">
                        <p className="text-[10px] text-[#EF4444] font-mono uppercase tracking-wider mb-2">Before</p>
                        <p className="text-xs text-[#6B7280] leading-relaxed line-through">{safe(s.beforeText) || '—'}</p>
                      </div>
                      <div className="bg-[rgba(34,197,94,0.05)] border border-[rgba(34,197,94,0.12)] rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] text-[#22C55E] font-mono uppercase tracking-wider">After</p>
                          <button onClick={() => copy(safe(s.afterText), `${i}`)}
                            className="text-[#374151] hover:text-[#C8F135] transition-colors">
                            {copied === `${i}` ? <Check size={12}/> : <Copy size={12}/>}
                          </button>
                        </div>
                        <p className="text-xs text-[#D1D5DB] leading-relaxed">{safe(s.afterText)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Bottom CTA ── */}
        <div className="flex items-center justify-between p-5 bg-[#111111] border border-[rgba(255,255,255,0.07)] rounded-2xl">
          <div>
            <p className="text-sm font-bold text-white">Want to prep for the interview?</p>
            <p className="text-xs text-[#6B7280] mt-0.5">Get 20 questions tailored to your exact gaps</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push(`/dashboard/interview-prep/${scan.id}`)}
              className="px-4 py-2.5 bg-[#C8F135] text-[#111] font-black text-sm rounded-xl hover:bg-[#d4f54a] transition-colors">
              Interview prep →
            </button>
            <button onClick={() => router.push('/dashboard')}
              className="px-4 py-2.5 bg-[#161616] border border-[rgba(255,255,255,0.08)] text-[#9CA3AF] font-semibold text-sm rounded-xl hover:text-white transition-colors">
              New scan
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

/* ── Processing screen ── */
function ProcessingScreen({ status }: { status: string }) {
  const msgs = ['Parsing your resume…', 'Matching keywords…', 'Scoring sections…', 'Generating suggestions…', 'Finalising report…']
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % msgs.length), 3000)
    return () => clearInterval(t)
  }, [])

  if (status === 'FAILED') return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <div className="text-center space-y-3">
        <XCircle size={32} className="text-[#EF4444] mx-auto"/>
        <p className="text-white font-bold">Analysis failed</p>
        <a href="/dashboard" className="text-xs text-[#C8F135] underline">← Try again</a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-xs px-4">
        <div className="relative w-20 h-20 mx-auto">
          {[0,1,2].map(i => (
            <div key={i} className="absolute inset-0 rounded-full border-2 border-[#C8F135] animate-ping"
              style={{ opacity: 0.15 - i * 0.04, animationDelay: `${i * 0.6}s` }}/>
          ))}
          <div className="w-20 h-20 rounded-full border-2 border-[#C8F135] flex items-center justify-center relative z-10 bg-[#0D0D0D]">
            <svg width="26" height="26" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="2.5" fill="#C8F135"/>
              <circle cx="10" cy="10" r="6"   stroke="#C8F135" strokeWidth="1.5" fill="none"/>
              <circle cx="10" cy="10" r="9"   stroke="#C8F135" strokeWidth="1"   fill="none" opacity="0.4"/>
            </svg>
          </div>
        </div>
        <div>
          <p className="text-white font-bold text-lg">Analysing your resume</p>
          <p className="text-sm text-[#C8F135] font-mono mt-2">{msgs[idx]}</p>
          <p className="text-xs text-[#374151] mt-2">20–40 seconds</p>
        </div>
        <div className="flex justify-center gap-1.5">
          {msgs.map((_, i) => (
            <div key={i} className="rounded-full transition-all duration-400"
              style={{ width: i === idx ? 20 : 5, height: 5, background: i === idx ? '#C8F135' : '#1F2937' }}/>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Section card ── */
function ResumeSection({
  title, score, issues, icon, children
}: {
  title:    string
  score:    number
  issues:   string[] | undefined
  icon:     React.ReactNode
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)
  const sc = sectionColor(score)

  return (
    <div className="bg-[#111111] border border-[rgba(255,255,255,0.07)] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center gap-3">
          <span style={{ color: sc.text }}>{icon}</span>
          <span className="text-sm font-semibold text-white">{title}</span>
          {(issues?.length ?? 0) > 0 && (
            <span className="text-[10px] font-mono text-[#D97706] bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.15)] px-2 py-0.5 rounded-full">
              {issues!.length} issue{issues!.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-black font-mono" style={{ color: sc.text }}>{score}</span>
            <span className="text-xs text-[#374151] font-mono">/10</span>
          </div>
          <ChevronDown size={14} className={`text-[#374151] transition-transform ${open ? 'rotate-180' : ''}`}/>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-[rgba(255,255,255,0.05)]">
          {(issues?.length ?? 0) > 0 && (
            <div className="mt-4 bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.12)] rounded-xl p-3 space-y-1.5">
              {issues!.map((iss, i) => (
                <p key={i} className="text-xs text-[#D97706] flex items-start gap-2">
                  <AlertTriangle size={10} className="flex-shrink-0 mt-0.5"/>{safe(iss)}
                </p>
              ))}
            </div>
          )}
          <div className="mt-4">{children}</div>
        </div>
      )}
    </div>
  )
}