import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Mic2, ArrowRight, CheckCircle2 } from 'lucide-react'

export default async function InterviewPrepPage() {
  const session = await getServerSession(authOptions)

  const scans = await prisma.scan.findMany({
    where:   { userId: session!.user.id, status: 'COMPLETE' },
    orderBy: { createdAt: 'desc' },
    take:    10,
    select: {
      id:              true,
      jobTitle:        true,
      companyName:     true,
      atsScore:        true,
      createdAt:       true,
      interviewSession: { select: { id: true } },
    },
  })

  return (
    <div className="min-h-screen bg-[#111111] p-6 md:p-10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[rgba(200,241,53,0.08)] border border-[rgba(200,241,53,0.15)] flex items-center justify-center">
            <Mic2 size={20} className="text-[#C8F135]"/>
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Interview Prep</h1>
            <p className="text-xs text-[#555555] mt-0.5">
              20 AI-generated questions based on your actual resume gaps vs the JD
            </p>
          </div>
        </div>

        {scans.length === 0 ? (
          <div className="bg-[#161616] border border-[rgba(255,255,255,0.06)] rounded-2xl p-12 text-center">
            <Mic2 size={32} className="text-[#333333] mx-auto mb-3"/>
            <p className="text-white font-bold mb-2">No scans yet</p>
            <p className="text-xs text-[#555555] mb-5">
              Run a resume scan first — interview questions are generated from your specific gaps
            </p>
            <Link href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C8F135] text-[#111] font-black text-sm rounded-xl hover:bg-[#d4f54a] transition-colors">
              Run first scan →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-[#444444] font-mono uppercase tracking-widest mb-4">
              Choose a scan to generate questions for
            </p>
            {scans.map((scan) => (
              <Link
                key={scan.id}
                href={`/dashboard/interview-prep/${scan.id}`}
                className="flex items-center gap-4 p-4 bg-[#161616] border border-[rgba(255,255,255,0.06)] rounded-2xl hover:border-[rgba(255,255,255,0.12)] transition-all group"
              >
                {/* Score */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: scan.atsScore! >= 70 ? 'rgba(200,241,53,0.1)' : scan.atsScore! >= 45 ? 'rgba(245,158,11,0.1)' : 'rgba(255,77,77,0.1)',
                    border:     `1px solid ${scan.atsScore! >= 70 ? 'rgba(200,241,53,0.25)' : scan.atsScore! >= 45 ? 'rgba(245,158,11,0.25)' : 'rgba(255,77,77,0.25)'}`,
                  }}>
                  <span className="font-mono text-lg font-black"
                    style={{ color: scan.atsScore! >= 70 ? '#C8F135' : scan.atsScore! >= 45 ? '#F59E0B' : '#FF4D4D' }}>
                    {scan.atsScore}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{scan.jobTitle}</p>
                  <p className="text-xs text-[#555555] mt-0.5">{scan.companyName}</p>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {scan.interviewSession ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#22C55E] bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.15)] px-2 py-1 rounded-full">
                      <CheckCircle2 size={10}/> Ready
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-[#444444] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] px-2 py-1 rounded-full">
                      Generate
                    </span>
                  )}
                  <ArrowRight size={14} className="text-[#333333] group-hover:text-[#C8F135] transition-colors"/>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}