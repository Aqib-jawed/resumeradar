import { Client } from '@upstash/qstash'
import { processScan } from '@/workers/scanProcessor'

/**
 * Enqueue a scan job to be processed by the worker route.
 * If QSTASH_TOKEN is missing, fallback to running processScan directly in the background.
 */
export async function enqueueScan(scanId: string): Promise<void> {
  if (!process.env.QSTASH_TOKEN) {
    console.log(`[DEV MODE] QSTASH_TOKEN is missing. Running processScan directly in background for scan ${scanId}`)
    // Run asynchronously without awaiting so the API response is sent immediately
    processScan(scanId).catch((err) => {
      console.error(`[DEV MODE ERROR] Error in background processScan:`, err)
    })
    return
  }

  const qstash = new Client({
    token: process.env.QSTASH_TOKEN,
  })

  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

  await qstash.publishJSON({
    url: `${baseUrl}/api/workers/process-scan`,
    body: { scanId },
    retries: 3,
  })

  console.log(`[QSTASH] Enqueued scan ${scanId}`)
}
