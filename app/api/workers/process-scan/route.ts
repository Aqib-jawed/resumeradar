import { NextRequest, NextResponse } from 'next/server'
import { Receiver } from '@upstash/qstash'
import { processScan } from '@/workers/scanProcessor'

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey:    process.env.QSTASH_NEXT_SIGNING_KEY!,
})

interface ProcessScanBody {
  scanId: string
}

export async function POST(req: NextRequest) {
  try {
    // Verify QStash signature
    const body = await req.text()
    const signature = req.headers.get('upstash-signature')

    if (!signature) {
      console.error('[WORKER] Missing QStash signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    const isValid = await receiver.verify({
      signature,
      body,
    })

    if (!isValid) {
      console.error('[WORKER] Invalid QStash signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const { scanId } = JSON.parse(body) as ProcessScanBody

    if (!scanId || typeof scanId !== 'string') {
      return NextResponse.json({ error: 'Missing scanId' }, { status: 400 })
    }

    console.log(`[WORKER] Processing scan ${scanId}`)
    await processScan(scanId)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[WORKER ERROR]', err)
    // Return 500 so QStash will retry
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    )
  }
}
