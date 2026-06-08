import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: { questionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id)
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { answer } = await req.json()

    const question = await prisma.interviewQuestion.update({
      where: { id: params.questionId },
      data:  { answer },
    })

    return NextResponse.json({ success: true, data: question })
  } catch (err) {
    console.error('[ANSWER SAVE ERROR]', err)
    return NextResponse.json({ success: false, error: 'Failed to save answer' }, { status: 500 })
  }
}