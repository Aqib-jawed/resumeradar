import { prisma } from './prisma'

const FREE_SCAN_LIMIT = 3

export class PlanLimitError extends Error {
  public readonly upgradeUrl = '/upgrade'
  public readonly code = 'PLAN_LIMIT' as const

  constructor(scansUsed: number, limit: number) {
    super(`Scan limit reached: ${scansUsed}/${limit}. Upgrade to Pro for unlimited scans.`)
    this.name = 'PlanLimitError'
  }
}

interface PlanStatus {
  plan:        string
  scansUsed:   number
  scansLimit:  number
  allowed:     boolean
}

/**
 * Check whether a user can create a new scan.
 * FREE users: 3 scans/month (resets monthly based on scansResetAt).
 * PRO users: unlimited.
 *
 * Automatically resets scansUsed if the current month has rolled over.
 * Throws PlanLimitError if the user has exceeded their limit.
 */
export async function checkPlanLimit(userId: string): Promise<PlanStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan:         true,
      scansUsed:    true,
      scansResetAt: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // PRO users have unlimited scans
  if (user.plan === 'PRO') {
    return {
      plan:       'PRO',
      scansUsed:  user.scansUsed,
      scansLimit: Infinity,
      allowed:    true,
    }
  }

  // Check if we need to reset the monthly counter
  const now       = new Date()
  const resetDate = new Date(user.scansResetAt)
  const needsReset =
    now.getMonth() !== resetDate.getMonth() ||
    now.getFullYear() !== resetDate.getFullYear()

  let currentUsed = user.scansUsed

  if (needsReset) {
    // Reset counter for the new month
    await prisma.user.update({
      where: { id: userId },
      data:  { scansUsed: 0, scansResetAt: now },
    })
    currentUsed = 0
  }

  const allowed = currentUsed < FREE_SCAN_LIMIT

  if (!allowed) {
    throw new PlanLimitError(currentUsed, FREE_SCAN_LIMIT)
  }

  return {
    plan:       'FREE',
    scansUsed:  currentUsed,
    scansLimit: FREE_SCAN_LIMIT,
    allowed:    true,
  }
}

/**
 * Get user's current usage stats without enforcing limits.
 * Used by the sidebar usage indicator.
 */
export async function getUserUsage(userId: string): Promise<{
  plan:       string
  scansUsed:  number
  scansLimit: number
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan:         true,
      scansUsed:    true,
      scansResetAt: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  if (user.plan === 'PRO') {
    return { plan: 'PRO', scansUsed: user.scansUsed, scansLimit: -1 }
  }

  // Check monthly reset
  const now       = new Date()
  const resetDate = new Date(user.scansResetAt)
  const needsReset =
    now.getMonth() !== resetDate.getMonth() ||
    now.getFullYear() !== resetDate.getFullYear()

  if (needsReset) {
    await prisma.user.update({
      where: { id: userId },
      data:  { scansUsed: 0, scansResetAt: now },
    })
    return { plan: 'FREE', scansUsed: 0, scansLimit: FREE_SCAN_LIMIT }
  }

  return { plan: 'FREE', scansUsed: user.scansUsed, scansLimit: FREE_SCAN_LIMIT }
}
