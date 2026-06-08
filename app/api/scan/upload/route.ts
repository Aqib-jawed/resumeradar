import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rateLimit'

const MAX_BYTES = 5 * 1024 * 1024
const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46])

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Rate limit: 10 uploads per user per hour
    const allowed = rateLimit(
      `upload:${session.user.id}`,
      10,
      60 * 60 * 1000
    )

    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many uploads. Please wait before trying again.',
        },
        { status: 429 }
      )
    }

    const form = await req.formData()

    const file = form.get('resume') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { success: false, error: 'File too large. Max 5MB' },
        { status: 400 }
      )
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Only PDF files accepted' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    if (!buffer.subarray(0, 4).equals(PDF_MAGIC)) {
      return NextResponse.json(
        { success: false, error: 'Invalid PDF file' },
        { status: 400 }
      )
    }

    const fileName = `${session.user.id}/${Date.now()}.pdf`

    const { error } = await supabaseAdmin.storage
      .from('resumes')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (error) {
      console.error('[UPLOAD ERROR]', error.message)

      return NextResponse.json(
        {
          success: false,
          error: `Upload failed: ${error.message}`,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        key: fileName,
      },
    })
  } catch (err: any) {
    console.error('[UPLOAD ERROR]', err)

    return NextResponse.json(
      {
        success: false,
        error: err.message ?? 'Something went wrong',
      },
      { status: 500 }
    )
  }
}