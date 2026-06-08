import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const form   = await req.formData()
    const file   = form.get('file') as File
    const buffer = Buffer.from(await file.arrayBuffer())

    console.log(`[TEST] Buffer size: ${buffer.length} bytes`)
    console.log(`[TEST] Magic bytes: ${buffer.subarray(0, 5).toString()}`)

    // Try pdf-parse
    try {
      const pdfParse = require('pdf-parse')
      const data     = await pdfParse(buffer)
      return NextResponse.json({
        method:  'pdf-parse',
        pages:   data.numpages,
        chars:   data.text?.length,
        preview: data.text?.slice(0, 500),
      })
    } catch (e: any) {
      return NextResponse.json({ error: e.message, method: 'pdf-parse failed' })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message })
  }
}