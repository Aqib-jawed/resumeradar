import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  CheckCircle2, XCircle, AlertTriangle, TrendingUp,
  Shield, Code2, Briefcase, GraduationCap, Star
} from 'lucide-react'

// Reuse helpers from the main results page
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

export default async function PublicReportPage({ params }: { params: { shareToken: string } }) {
  const scan = await prisma.scan.findUnique({
    where: { shareToken: params.shareToken, isPublic: true },
  })

  if (!scan) {
    notFound()
  }

  const { main, glow, label } = atsColor(scan.atsScore ?? 0)

  // Type coercions for JSON fields
  const keywords = scan.keywords as any
  const sectionGrades = scan.sectionGrades as any
  const indiaFlags = scan.indiaFlags as any

  return (
    <div className="min-h-screen bg-[#0D0D0D] p-6 md:p-10 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-6 h-6 rounded-full border-2 border-[#C8F135] flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="2.5" fill="#C8F135"/>
                  <circle cx="10" cy="10" r="6"   stroke="#C8F135" strokeWidth="1.5" fill="none"/>
                </svg>
              </div>
              <span className="font-bold text-white text-sm tracking-tight">ResumeRadar</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">{scan.jobTitle}</h1>
            <p className="text-sm text-[#6B7280] mt-1">{scan.companyName}</p>
          </div>
          <Link href="/dashboard" className="px-4 py-2 bg-[#C8F135] text-[#111] font-black text-xs rounded-lg hover:bg-[#d4f54a] transition-colors">
            Analyse your own resume
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Score */}
          <div className="bg-[#111111] border border-[rgba(255,255,255,0.07)] rounded-2xl p-8 flex flex-col items-center justify-center">
            <p className="text-[10px] font-mono text-[#4B5563] uppercase tracking-widest mb-6">ATS Score</p>
            <div className="relative mb-6" style={{ filter: `drop-shadow(0 0 20px ${glow})` }}>
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="56" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
                <circle cx="70" cy="70" r="56" fill="none"
                  stroke={main} strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={351.85} strokeDashoffset={351.85 - ((scan.atsScore ?? 0) / 100) * 351.85}
                  transform="rotate(-90 70 70)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black font-mono leading-none" style={{ color: main }}>{scan.atsScore}</span>
                <span className="text-[10px] text-[#6B7280] font-mono mt-1 uppercase tracking-wider">/ 100</span>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full border" style={{
              color: main, background: glow, borderColor: `${main}40`,
            }}>{label}</span>
          </div>

          {/* Section Grades */}
          <div className="md:col-span-2 bg-[#111111] border border-[rgba(255,255,255,0.07)] rounded-2xl p-6">
            <p className="text-[10px] font-mono text-[#4B5563] uppercase tracking-widest mb-5">Section Grades</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'education',  label: 'Education',  icon: <GraduationCap size={16}/> },
                { key: 'skills',     label: 'Skills',     icon: <Code2 size={16}/>          },
                { key: 'experience', label: 'Experience', icon: <Briefcase size={16}/>      },
                { key: 'projects',   label: 'Projects',   icon: <Star size={16}/>           },
              ].map(({ key, label, icon }) => {
                const score = sectionGrades?.[key] ?? 0
                const sc = sectionColor(score)
                return (
                  <div key={key} className="bg-[#161616] rounded-xl p-4 border border-[rgba(255,255,255,0.04)]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span style={{ color: sc.text }}>{icon}</span>
                        <span className="text-sm text-[#9CA3AF] font-medium">{label}</span>
                      </div>
                      <span className="text-xl font-black font-mono" style={{ color: sc.text }}>{score}<span className="text-xs text-[#4B5563]">/10</span></span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Keywords */}
        {keywords && (
          <div className="bg-[#111111] border border-[rgba(255,255,255,0.07)] rounded-2xl p-6">
            <p className="text-[10px] font-mono text-[#4B5563] uppercase tracking-widest mb-5">Keyword Gap Map</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Matched', count: keywords.matched?.length ?? 0, list: keywords.matched, color: '#22C55E', icon: <CheckCircle2 size={14}/> },
                { label: 'Missing', count: keywords.missing?.length ?? 0, list: keywords.missing, color: '#EF4444', icon: <XCircle size={14}/>       },
                { label: 'Bonus',   count: keywords.bonus?.length   ?? 0, list: keywords.bonus,   color: '#C8F135', icon: <TrendingUp size={14}/>    },
              ].map(({ label, count, list, color, icon }) => (
                <div key={label}>
                  <div className="flex items-center gap-2 mb-3" style={{ color }}>
                    {icon}
                    <span className="text-sm font-semibold">{label} ({count})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {count === 0 && <span className="text-xs text-[#374151]">None</span>}
                    {(list || []).map((kw: string) => (
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
        )}

        {/* India Flags */}
        {(indiaFlags?.length ?? 0) > 0 && (
          <div className="bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.18)] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={14} className="text-[#F59E0B]"/>
              <span className="text-xs font-semibold text-[#F59E0B] uppercase tracking-widest font-mono">India-specific warnings</span>
            </div>
            {(indiaFlags || []).map((f: any, i: number) => (
              <div key={i} className="flex items-start gap-2 text-sm text-[#D97706] mb-2 last:mb-0">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5"/>
                {safe(f.message)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
