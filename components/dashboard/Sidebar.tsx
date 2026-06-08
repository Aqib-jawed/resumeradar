'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import {
  LayoutDashboard, FileSearch, Ghost,
  Mic2, FileCode2, TrendingUp, LogOut,
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const NAV = [
  { label: 'Dashboard',      href: '/dashboard',        icon: LayoutDashboard },
  { label: 'My Scans',       href: '/dashboard/scans',  icon: FileSearch      },
  { label: 'Ghost Mode',     href: '/dashboard/ghost-mode',      icon: Ghost  },
  { label: 'Interview Prep', href: '/dashboard/interview-prep',  icon: Mic2   },
  { label: 'JD Decoder',     href: '/dashboard/jd-decoder',      icon: FileCode2 },
  { label: 'Score Timeline', href: '/dashboard/history', icon: TrendingUp     },
]

interface SidebarProps {
  user: { name?: string | null; email?: string | null; plan?: string | null }
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-60 bg-[#111111] border-r border-[rgba(255,255,255,0.06)] flex-col z-40">

      {/* Logo */}
      <div className="p-5 border-b border-[rgba(255,255,255,0.06)]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full border-2 border-[#C8F135] flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="2.5" fill="#C8F135"/>
              <circle cx="10" cy="10" r="6"   stroke="#C8F135" strokeWidth="1.5" fill="none"/>
              <circle cx="10" cy="10" r="9"   stroke="#C8F135" strokeWidth="1"   fill="none" opacity="0.4"/>
            </svg>
          </div>
          <span className="font-bold text-white text-base tracking-tight">ResumeRadar</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-[#C8F135] text-[#111111]'
                  : 'text-[#888888] hover:text-white hover:bg-[rgba(255,255,255,0.06)]'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + plan */}
      <div className="p-3 border-t border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
          <div className="w-7 h-7 rounded-full bg-[#C8F135] flex items-center justify-center text-[#111111] text-xs font-black flex-shrink-0">
            {user.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-[#555555] truncate">{user.email}</p>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#C8F135] bg-[rgba(200,241,53,0.1)] px-1.5 py-0.5 rounded">
            FREE
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#555555] hover:text-[#FF4D4D] hover:bg-[rgba(255,77,77,0.06)] transition-all w-full"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  )
}