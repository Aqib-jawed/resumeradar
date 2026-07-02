import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserUsage } from '@/lib/planGate'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const usage = await getUserUsage(session.user.id)

    return NextResponse.json({
      success: true,
      data:    usage,
    })
  } catch (err) {
    console.error('[USER USAGE ERROR]', err)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
