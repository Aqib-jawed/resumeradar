import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { enqueueScan } from '@/lib/qstash'
import { checkPlanLimit, PlanLimitError } from '@/lib/planGate'

const schema = z.object({
  jobTitle:       z.string().min(2),
  companyName:    z.string().min(1),
  jobDescription: z.string().min(50),
  resumeS3Key:    z.string().min(1),
})

function detectCompanyType(name: string) {
  const n = name.toLowerCase()
  if (/\b(lic|ongc|ntpc|bhel|bsnl|iocl|sail|irctc|nhai)\b/.test(n))                                   return 'PSU'
  if (/\b(government|govt|municipal|ministry|collector)\b/.test(n))                                     return 'GOVERNMENT'
  if (/\b(google|microsoft|amazon|meta|apple|tcs|infosys|wipro|hcl|accenture|ibm|deloitte)\b/.test(n)) return 'MNC'
  return 'STARTUP'
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id)
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    // Plan gating — check scan limits before creating
    try {
      await checkPlanLimit(session.user.id)
    } catch (err) {
      if (err instanceof PlanLimitError) {
        return NextResponse.json(
          { success: false, error: 'PLAN_LIMIT', upgradeUrl: err.upgradeUrl, message: err.message },
          { status: 403 }
        )
      }
      throw err
    }

    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { jobTitle, companyName, jobDescription, resumeS3Key } = parsed.data

    // Create scan record in DB
    const scan = await prisma.scan.create({
      data: {
        userId:        session.user.id,
        jobTitle,
        companyName,
        companyType:   detectCompanyType(companyName) as 'PSU' | 'GOVERNMENT' | 'MNC' | 'STARTUP',
        jobDescription,
        resumeS3Key,
        status:        'PENDING',
      },
    })

    // Enqueue scan job via QStash — scansUsed is incremented
    // inside processScan() only after status is set to COMPLETE
    await enqueueScan(scan.id)

    return NextResponse.json(
      { success: true, data: { scanId: scan.id } },
      { status: 201 }
    )

  } catch (err) {
    console.error('[SCAN CREATE ERROR]', err)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}