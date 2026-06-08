'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, CheckCircle2, Zap, Target, Flag } from 'lucide-react'

export default function LandingPage() {
  const [roastMode, setRoastMode] = useState(false)

  return (
    <div className="min-h-screen bg-[#F5F4F0] font-display">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F5F4F0] border-b border-[rgba(0,0,0,0.06)]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full border-2 border-[#111] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="2.5" fill="#111"/>
                <circle cx="10" cy="10" r="6" stroke="#111" strokeWidth="1.5" fill="none"/>
                <circle cx="10" cy="10" r="9" stroke="#111" strokeWidth="1" fill="none" opacity="0.3"/>
              </svg>
            </div>
            <span className="font-black text-[#111] text-sm tracking-tight">ResumeRadar</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {['How it works', 'Features', 'Roast Mode'].map(item => (
              <a key={item} href="#" className="text-sm text-[#666] hover:text-[#111] transition-colors">{item}</a>
            ))}
          </div>

          <Link href="/register"
            className="px-4 py-2 bg-[#C8F135] text-[#111] text-sm font-black rounded-lg hover:bg-[#d4f54a] transition-colors">
            Try for free
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#111] text-[#C8F135] text-xs font-mono px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-[#C8F135] rounded-full animate-pulse"/>
              2,400+ resumes analysed this week
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-[#111] leading-[1.0] tracking-tight mb-6">
              Your resume is being{' '}
              <span className="relative inline-block">
                <span className="relative z-10">rejected</span>
                <span className="absolute inset-0 bg-[#C8F135] -rotate-1 z-0"/>
              </span>{' '}
              before anyone reads it.
            </h1>

            <p className="text-base text-[#666] leading-relaxed mb-8 max-w-md">
              ResumeRadar analyses your resume against the exact job you're applying for — and tells you precisely what to fix. Job-specific. Company-aware. Built for the Indian job market.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-8">
              {['2,400 resumes analysed this week', 'TCS', 'BFSI', 'SDE', 'IIM colleges'].map((tag, i) => (
                <span key={tag} className={`text-xs font-mono px-2.5 py-1 rounded-full border ${
                  i === 0
                    ? 'bg-transparent border-[rgba(0,0,0,0.15)] text-[#666]'
                    : 'bg-[#111] text-[#C8F135] border-[#111]'
                }`}>{tag}</span>
              ))}
            </div>

            <Link href="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#C8F135] text-[#111] font-black text-base rounded-xl hover:bg-[#d4f54a] active:scale-[0.98] transition-all">
              Analyse my resume →
            </Link>
          </div>

          {/* Right — form mockup */}
          <div className="bg-[#111] rounded-2xl p-6 shadow-2xl">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-[#555] font-mono uppercase tracking-wider block mb-1.5">Job Title</label>
                <div className="w-full h-11 bg-[#1a1a1a] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 flex items-center">
                  <span className="text-sm text-[#444]">e.g. Data Analyst, SDE-2, Product Manager</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-[#555] font-mono uppercase tracking-wider block mb-1.5">Company Name</label>
                <div className="w-full h-11 bg-[#1a1a1a] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 flex items-center">
                  <span className="text-sm text-[#444]">e.g. Razorpay, Google, Infosys</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-[#555] font-mono uppercase tracking-wider block mb-1.5">Paste Job Description</label>
                <div className="w-full h-24 bg-[#1a1a1a] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-3">
                  <span className="text-sm text-[#333]">Paste the full JD here. The more you give us, the sharper your analysis will be...</span>
                </div>
              </div>
              <Link href="/register"
                className="w-full h-11 bg-[#C8F135] text-[#111] font-black text-sm rounded-lg flex items-center justify-center hover:bg-[#d4f54a] transition-colors">
                Continue →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-6 bg-white border-y border-[rgba(0,0,0,0.06)]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-mono text-[#999] uppercase tracking-widest mb-12 text-center">The process</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: '01', icon: <Target size={20}/>,
                title: 'Enter the job',
                desc: 'Job title, company, paste the JD. AI maps every keyword recruiters scan for — based on the exact company type.',
              },
              {
                num: '02', icon: <Zap size={20}/>,
                title: 'Upload your resume',
                desc: 'PDF drag and drop. We parse every section against the job requirements. No fluff — just what matters.',
                dark: true,
              },
              {
                num: '03', icon: <CheckCircle2 size={20}/>,
                title: 'Get your report',
                desc: 'ATS score, section grades, exact rewrites, predicted interview questions. Everything you need. Nothing you don\'t.',
              },
            ].map(({ num, icon, title, desc, dark }) => (
              <div key={num} className={`rounded-2xl p-6 border ${
                dark
                  ? 'bg-[#111] border-[rgba(255,255,255,0.06)] text-white'
                  : 'bg-[#F5F4F0] border-[rgba(0,0,0,0.08)] text-[#111]'
              }`}>
                <div className="flex items-start justify-between mb-6">
                  <span className={`text-4xl font-black font-mono opacity-20 ${dark ? 'text-white' : 'text-[#111]'}`}>{num}</span>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dark ? 'bg-[#1a1a1a]' : 'bg-white border border-[rgba(0,0,0,0.08)]'}`}>
                    <span className={dark ? 'text-[#C8F135]' : 'text-[#111]'}>{icon}</span>
                  </div>
                </div>
                <h3 className={`text-lg font-black mb-2 ${dark ? 'text-white' : 'text-[#111]'}`}>{title}</h3>
                <p className={`text-sm leading-relaxed ${dark ? 'text-[#666]' : 'text-[#888]'}`}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOT A SCORE, A ROADMAP ── */}
      <section className="py-24 px-6 bg-[#111]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-mono text-[#555] uppercase tracking-widest mb-4">True results</p>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight mb-6">
              Not a score.<br/>A roadmap.
            </h2>
            <p className="text-sm text-[#666] leading-relaxed mb-8 max-w-sm">
              Every number tells you something specific. Every section grade comes with exact instructions. No vague advice. Everything.
            </p>
            <ul className="space-y-3">
              {[
                'Company-aware scoring — Google ≠ startup ≠ government',
                'Keyword gap map with exact missing terms',
                'Before/after bullet point rewriter',
                'Predicted interview questions from your gaps',
              ].map(item => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#C8F135] flex-shrink-0 mt-0.5"/>
                  <span className="text-sm text-[#888]">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Score card mockup */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-5xl font-black text-[#111] font-mono">74</span>
              <span className="text-lg text-[#999] font-mono">/100</span>
            </div>
            <p className="text-xs text-[#22C55E] font-mono mb-5">SDE — LIKELY TO PASS INITIAL SCREENING</p>

            <div className="space-y-3 mb-5">
              {[
                { label: 'Experience', grade: 'Strong', color: '#C8F135', pct: 88 },
                { label: 'Skills',     grade: 'Avg',    color: '#F59E0B', pct: 52 },
                { label: 'Education',  grade: 'Avg',    color: '#F59E0B', pct: 55 },
                { label: 'Projects',   grade: 'Missing',color: '#FF4D4D', pct: 20 },
              ].map(({ label, grade, color, pct }) => (
                <div key={label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-semibold text-[#333]">{label}</span>
                    <span className="text-xs font-mono font-bold" style={{ color }}>{grade}</span>
                  </div>
                  <div className="h-2 bg-[#F5F4F0] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }}/>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {['Python ✓', 'SQL ✓', 'Tableau ✓', 'Spark ✗', 'dbt ✗', 'Airflow ✗'].map(kw => (
                <span key={kw} className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  kw.includes('✓')
                    ? 'bg-[rgba(34,197,94,0.08)] text-[#22C55E] border-[rgba(34,197,94,0.2)]'
                    : 'bg-[rgba(255,77,77,0.08)] text-[#FF4D4D] border-[rgba(255,77,77,0.2)]'
                }`}>{kw}</span>
              ))}
            </div>

            <div className="bg-[#F5F4F0] rounded-xl p-3 text-xs text-[#666] leading-relaxed">
              <strong className="text-[#111]">Skills:</strong> Add dbt and Airflow — both appear 4x in JD and are missing from your resume entirely.
            </div>
          </div>
        </div>
      </section>

      {/* ── ROAST MODE ── */}
      <section className="py-24 px-6 bg-[#F5F4F0]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-mono text-[#999] uppercase tracking-widest mb-4">Roast mode</p>
            <h2 className="text-4xl md:text-5xl font-black text-[#111] leading-tight tracking-tight mb-4">
              Want the brutal truth? Turn on Roast Mode.
            </h2>
            <p className="text-sm text-[#666] leading-relaxed mb-8">
              Polite suggestions are for people who want to feel good. Roast Mode is for people who actually want the job. Honest, specific, and yes — occasionally savage.
            </p>
            <div className="flex items-center gap-0 bg-[#e5e4e0] rounded-full p-1 w-fit">
              <button onClick={() => setRoastMode(false)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${!roastMode ? 'bg-white text-[#111] shadow-sm' : 'text-[#999]'}`}>
                Polite Mode
              </button>
              <button onClick={() => setRoastMode(true)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${roastMode ? 'bg-[#FF4D4D] text-white' : 'text-[#999]'}`}>
                Roast Mode
              </button>
            </div>
          </div>

          {/* Roast card */}
          <div className={`rounded-2xl p-6 transition-all duration-300 ${roastMode ? 'bg-[#111]' : 'bg-white border border-[rgba(0,0,0,0.08)]'}`}>
            <p className={`text-xs font-mono mb-4 ${roastMode ? 'text-[#FF4D4D]' : 'text-[#999]'}`}>
              Your resume, {roastMode ? 'roasted 🔥' : 'reviewed ✓'}
            </p>
            {roastMode ? (
              <div className="space-y-4">
                {[
                  { section: 'Skills section · Critical', text: '"Your Skills section is a lie detector\'s nightmare. Proficient in Excel with zero evidence? Everyone says this. Nobody believes it."' },
                  { section: 'Experience · Too vague', text: '"You described 8 months of internship work in one vague line. That\'s not humility. That\'s self-sabotage."' },
                  { section: 'DOB · Remove now', text: '"Your home address is on here. In 2024. Why? 80% of MNC ATS systems flag this. Remove it immediately."' },
                ].map(({ section, text }) => (
                  <div key={section} className="border-l-2 border-[#FF4D4D] pl-3">
                    <p className="text-[10px] text-[#FF4D4D] font-mono uppercase mb-1">{section}</p>
                    <p className="text-sm text-[#aaa] italic leading-relaxed">{text}</p>
                  </div>
                ))}
                <Link href="/register"
                  className="w-full h-10 border border-[rgba(255,77,77,0.3)] text-[#FF4D4D] text-sm font-bold rounded-lg flex items-center justify-center hover:bg-[rgba(255,77,77,0.1)] transition-colors mt-2">
                  Share your roast →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { section: 'Skills section', text: 'Consider adding specific tools and frameworks mentioned in the job description to improve keyword alignment.' },
                  { section: 'Experience', text: 'Adding quantifiable metrics to your experience bullets would strengthen the impact of your achievements.' },
                  { section: 'Personal info', text: 'Removing personal details like home address can improve ATS compatibility with modern screening systems.' },
                ].map(({ section, text }) => (
                  <div key={section} className="border-l-2 border-[rgba(0,0,0,0.1)] pl-3">
                    <p className="text-[10px] text-[#999] font-mono uppercase mb-1">{section}</p>
                    <p className="text-sm text-[#666] leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 px-6 bg-white border-y border-[rgba(0,0,0,0.06)]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-mono text-[#999] uppercase tracking-widest mb-4 text-center">What makes it different</p>
          <h2 className="text-3xl font-black text-[#111] text-center mb-12">
            Every other tool gives you<br/>the same 5 tips. We don't.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: <Target size={18}/>,
                title: 'Company-aware scoring',
                desc: 'Google ≠ a startup ≠ a PSU. We score your resume against the company type — not a generic template.',
                tags: ['STARTUP', 'GOVT', 'MNC', 'DIRECTOR'],
              },
              {
                icon: <Zap size={18}/>,
                title: 'Interview question predictor',
                desc: 'We predict the 5 questions a recruiter will ask based on your resume gaps. Walk in prepared, not surprised.',
                tags: ['PREDICTED BY AI ANALYSIS'],
              },
              {
                icon: <Flag size={18}/>,
                title: 'Built for India',
                desc: 'Naukri, Internshala, Campus drives. Photo, DOB, address flags. No Western tool thinks about this. We do.',
                tags: ['NAUKRI', 'LINKEDIN', 'INTERNSHALA'],
              },
            ].map(({ icon, title, desc, tags }) => (
              <div key={title} className="bg-[#F5F4F0] border border-[rgba(0,0,0,0.08)] rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-[#111] flex items-center justify-center text-[#C8F135] mb-4">
                  {icon}
                </div>
                <h3 className="text-base font-black text-[#111] mb-2">{title}</h3>
                <p className="text-sm text-[#888] leading-relaxed mb-4">{desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(tag => (
                    <span key={tag} className="text-[10px] font-mono text-[#999] bg-white border border-[rgba(0,0,0,0.08)] px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="py-20 px-6 bg-[#F5F4F0]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-mono text-[#999] uppercase tracking-widest mb-4">From our users</p>
            <blockquote className="text-2xl font-black text-[#111] leading-snug mb-4">
              "I went from 2 callbacks in 3 months to 6 in one week after fixing what ResumeRadar flagged."
            </blockquote>
            <p className="text-sm text-[#999]">Riya S. — Triton, Grad-Dec, NIT Trichy</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: '2,400+', label: 'Resumes analysed this week' },
              { num: '+68pts', label: 'Average ATS score improvement' },
              { num: '200+', label: 'Companies using ResumeRadar' },
            ].map(({ num, label }) => (
              <div key={label} className="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl p-5">
                <div className="text-3xl font-black text-[#111] font-mono mb-1">{num}</div>
                <div className="text-xs text-[#999]">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-6 bg-[#111]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-mono text-[#555] uppercase tracking-widest mb-4">The first step</p>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight mb-4">
            Your next application deserves better than guesswork.
          </h2>
          <p className="text-sm text-[#666] mb-8">
            No sign-up needed for your first scan. Takes less than 2 minutes.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/register"
              className="px-6 py-3.5 bg-[#C8F135] text-[#111] font-black text-sm rounded-xl hover:bg-[#d4f54a] transition-colors">
              Analyse my resume →
            </Link>
            <Link href="/register"
              className="px-6 py-3.5 bg-transparent text-white border border-[rgba(255,255,255,0.15)] font-black text-sm rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-colors">
              Roast my resume
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0e0e0e] border-t border-[rgba(255,255,255,0.05)] px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <p className="text-xs font-mono text-[#555] uppercase tracking-widest mb-4">ResumeRadar</p>
              <p className="text-xs text-[#444] leading-relaxed">
                AI-powered ATS intelligence for the Indian job market.
              </p>
            </div>
            {[
              { heading: 'Product',   links: ['How it works', 'ATS Guide', 'Roast Mode', 'Pricing'] },
              { heading: 'Resources', links: ['ATS Guide', 'Blog', 'Sample reports'] },
              { heading: 'Legal',     links: ['Privacy Policy', 'Terms of Use', 'Cookie Policy'] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <p className="text-xs font-mono text-[#555] uppercase tracking-widest mb-4">{heading}</p>
                <ul className="space-y-2">
                  {links.map(l => (
                    <li key={l}>
                      <a href="#" className="text-xs text-[#444] hover:text-[#888] transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-[rgba(255,255,255,0.04)] pt-6 flex items-center justify-between">
            <p className="text-xs text-[#333] font-mono">© 2025 ResumeRadar</p>
            <p className="text-xs text-[#333]">Built for India 🇮🇳</p>
          </div>
        </div>
      </footer>

    </div>
  )
}