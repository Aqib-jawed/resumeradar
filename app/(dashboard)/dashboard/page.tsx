import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ScanWizard from '@/components/dashboard/ScanWizard'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  const recentScans = await prisma.scan.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      jobTitle: true,
      companyName: true,
      atsScore: true,
      status: true,
      createdAt: true,
    },
  })

  return (
    <div className="min-h-screen bg-[#111111] p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight">
            New scan
          </h1>
          <p className="text-sm text-[#666666] mt-1">
            Paste the job description and upload your resume — results in under
            60 seconds.
          </p>
        </div>

        {/* Wizard */}
        <ScanWizard />

        {/* Recent scans */}
        {recentScans.length > 0 && (
          <div className="mt-12">
            <h2 className="text-sm font-semibold text-[#555555] uppercase tracking-widest font-mono mb-4">
              Recent scans
            </h2>

            <div className="space-y-2">
              {recentScans.map((scan) => (
                <Link
                  key={scan.id}
                  href={`/dashboard/results/${scan.id}`}
                  className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-[rgba(255,255,255,0.06)] rounded-xl hover:border-[rgba(255,255,255,0.12)] transition-all group"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {scan.jobTitle}
                    </p>
                    <p className="text-xs text-[#555555] mt-0.5">
                      {scan.companyName}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {scan.status === 'COMPLETE' &&
                    scan.atsScore !== null ? (
                      <span
                        className={`font-mono text-lg font-bold ${
                          scan.atsScore >= 70
                            ? 'text-[#C8F135]'
                            : scan.atsScore >= 45
                            ? 'text-[#F59E0B]'
                            : 'text-[#FF4D4D]'
                        }`}
                      >
                        {scan.atsScore}
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-[#555555]">
                        {scan.status}
                      </span>
                    )}

                    <span className="text-[#333333] group-hover:text-[#666666] transition-colors">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}