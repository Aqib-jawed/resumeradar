// Simple in-memory rate limiter — no Redis needed
const requests = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now    = Date.now()
  const record = requests.get(key)

  if (!record || now > record.resetAt) {
    requests.set(key, { count: 1, resetAt: now + windowMs })
    return true  // allowed
  }

  if (record.count >= limit) return false  // blocked

  record.count++
  return true  // allowed
}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  requests.forEach((val, key) => {
    if (now > val.resetAt) requests.delete(key)
  })
}, 5 * 60 * 1000)