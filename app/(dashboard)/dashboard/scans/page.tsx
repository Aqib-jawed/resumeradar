import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ScansClient from '@/components/dashboard/ScansClient'

export default async function ScansPage() {
  const session = await getServerSession(authOptions)

  const scans = await prisma.scan.findMany({
    where:   { userId: session!.user.id, status: 'COMPLETE' },
    orderBy: { createdAt: 'asc' },
    select: {
      id:          true,
      jobTitle:    true,
      companyName: true,
      companyType: true,
      atsScore:    true,
      status:      true,
      createdAt:   true,
    },
  })

  return <ScansClient scans={scans.map(s => ({ ...s, createdAt: s.createdAt.toISOString() }))} />
}