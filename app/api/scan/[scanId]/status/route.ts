import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { scanId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const scan = await prisma.scan.findFirst({
      where: { id: params.scanId, userId: session.user.id },
      select: {
        id: true, status: true, atsScore: true,
        jobTitle: true, companyName: true, companyType: true,
        createdAt: true,
      },
    })

    if (!scan) {
      return NextResponse.json({ success: false, error: 'Scan not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: scan })

  } catch (err) {
    console.error('[SCAN STATUS ERROR]', err)
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}