import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(
  req: NextRequest,
  { params }: { params: { scanId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const scan = await prisma.scan.findUnique({
      where: { id: params.scanId, userId: session.user.id },
    })

    if (!scan) {
      return NextResponse.json({ success: false, error: 'Scan not found' }, { status: 404 })
    }

    // If already public, just return existing token
    if (scan.isPublic && scan.shareToken) {
      return NextResponse.json({
        success: true,
        data: { shareToken: scan.shareToken }
      })
    }

    // Generate new token using crypto.randomUUID()
    const shareToken = crypto.randomUUID().replace(/-/g, '').substring(0, 16)

    await prisma.scan.update({
      where: { id: params.scanId },
      data: {
        isPublic: true,
        shareToken,
      },
    })

    return NextResponse.json({
      success: true,
      data: { shareToken }
    })
  } catch (err) {
    console.error('[SHARE SCAN ERROR]', err)
    return NextResponse.json({ success: false, error: 'Failed to share report' }, { status: 500 })
  }
}
