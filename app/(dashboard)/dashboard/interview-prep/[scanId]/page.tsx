'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Mic2, ChevronDown, Lightbulb, ArrowLeft, CheckCircle2, Clock } from 'lucide-react'

const CATEGORIES = ['Technical', 'Gap-Based', 'Behavioral', 'Culture Fit', 'Trick'] as const
type Category = typeof CATEGORIES[number]

const CATEGORY_CONFIG: Record<Category, { color: string; bg: string; border: string; desc: string }> = {
  'Technical':    { color: '#C8F135', bg: 'rgba(200,241,53,0.08)',  border: 'rgba(200,241,53,0.2)',  desc: 'Core technical skills from the JD'        },
  'Gap-Based':    { color: '#FF4D4D', bg: 'rgba(255,77,77,0.08)',   border: 'rgba(255,77,77,0.2)',   desc: 'Directly targeting your resume gaps'       },
  'Behavioral':   { color: '#818CF8', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.2)', desc: 'STAR format — situation, task, action, result' },
  'Culture Fit':  { color: '#22C55E', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)',   desc: 'Working style, team fit, values alignment'  },
  'Trick':        { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)',  desc: 'Gotcha questions interviewers love to use'  },
}

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy:   '#22C55E',
  Medium: '#F59E0B',
  Hard:   '#FF4D4D',
}

interface Question {
  id:         string
  category:   Category
  difficulty: string
  question:   string
  hint:       string
  answer:     string | null
  order:      number
}

export default function InterviewPrepScanPage() {
  const params  = useParams()
  const router  = useRouter()
  const scanId  = params.scanId as string

  const [questions,    setQuestions]    = useState<Question[]>([])
  const [loading,      setLoading]      = useState(true)
  const [generating,   setGenerating]   = useState(false)
  const [activeTab,    setActiveTab]    = useState<Category>('Technical')
  const [openQ,        setOpenQ]        = useState<string | null>(null)
  const [answers,      setAnswers]      = useState<Record<string, string>>({})
  const [saving,       setSaving]       = useState<string | null>(null)
  const [showHint,     setShowHint]     = useState<Record<string, boolean>>({})
  const [mockMode,     setMockMode]     = useState(false)
  const [mockTimer,    setMockTimer]    = useState(0)
  const [mockActive,   setMockActive]   = useState(false)

  // Load or generate questions
  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch('/api/interview/generate', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ scanId }),
        })
        const json = await res.json()
        if (json.success) {
          setQuestions(json.data.questions ?? [])
          // Pre-populate saved answers
          const saved: Record<string, string> = {}
          for (const q of json.data.questions ?? []) {
            if (q.answer) saved[q.id] = q.answer
          }
          setAnswers(saved)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
        setGenerating(false)
      }
    }

    setGenerating(true)
    load()
  }, [scanId])

  // Mock interview timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (mockActive) {
      interval = setInterval(() => setMockTimer(t => t + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [mockActive])

  async function saveAnswer(questionId: string) {
    const answer = answers[questionId]
    if (!answer?.trim()) return
    setSaving(questionId)
    try {
      await fetch(`/api/interview/${questionId}/answer`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ answer }),
      })
    } finally {
      setSaving(null)
    }
  }

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const filteredQs = questions.filter(q => q.category === activeTab)
  const answeredCount = Object.values(answers).filter(a => a?.trim()).length
  const cfg = CATEGORY_CONFIG[activeTab]

  if (loading || generating) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-2 border-[#C8F135] flex items-center justify-center mx-auto">
            <Mic2 size={24} className="text-[#C8F135]"/>
          </div>
          <div>
            <p className="text-white font-bold">Generating your questions…</p>
            <p className="text-xs text-[#555555] mt-1">Analysing your resume gaps vs the JD</p>
          </div>
          <div className="flex justify-center gap-1">
            {[0,1,2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#C8F135] animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}/>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#111111] p-6 md:p-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard/interview-prep')}
              className="text-[#444444] hover:text-white transition-colors">
              <ArrowLeft size={18}/>
            </button>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight">Interview Prep</h1>
              <p className="text-xs text-[#555555] mt-0.5">
                {answeredCount}/{questions.length} questions answered
              </p>
            </div>
          </div>

          {/* Mock mode toggle */}
          <div className="flex items-center gap-3">
            {mockMode && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-[#C8F135]">{formatTime(mockTimer)}</span>
                <button
                  onClick={() => { setMockActive(a => !a) }}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                    mockActive
                      ? 'bg-[rgba(255,77,77,0.1)] border-[rgba(255,77,77,0.3)] text-[#FF4D4D]'
                      : 'bg-[rgba(200,241,53,0.1)] border-[rgba(200,241,53,0.2)] text-[#C8F135]'
                  }`}>
                  {mockActive ? 'Pause' : 'Start'}
                </button>
              </div>
            )}
            <button
              onClick={() => { setMockMode(m => !m); setMockTimer(0); setMockActive(false) }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                mockMode
                  ? 'bg-[rgba(200,241,53,0.1)] border-[rgba(200,241,53,0.2)] text-[#C8F135]'
                  : 'bg-[#1a1a1a] border-[rgba(255,255,255,0.06)] text-[#555555] hover:text-white'
              }`}>
              <Clock size={13}/>{mockMode ? 'Mock ON' : 'Mock mode'}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div className="h-full bg-[#C8F135] rounded-full transition-all duration-500"
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}/>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 mb-6 bg-[#161616] border border-[rgba(255,255,255,0.06)] rounded-xl p-1">
          {CATEGORIES.map(cat => {
            const c     = CATEGORY_CONFIG[cat]
            const count = questions.filter(q => q.category === cat).length
            const done  = questions.filter(q => q.category === cat && answers[q.id]?.trim()).length
            return (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`flex-1 flex flex-col items-center py-2.5 px-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === cat ? 'text-[#111]' : 'text-[#444444] hover:text-white'
                }`}
                style={activeTab === cat ? { background: c.color } : {}}
              >
                <span className="text-[10px] font-mono hidden sm:block">{cat}</span>
                <span className="text-[10px] font-mono sm:hidden">{cat.split(' ')[0]}</span>
                <span className={`text-[9px] font-mono mt-0.5 ${activeTab === cat ? 'text-[rgba(0,0,0,0.6)]' : 'text-[#333333]'}`}>
                  {done}/{count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Category description */}
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }}/>
          <p className="text-xs text-[#555555]">{cfg.desc}</p>
        </div>

        {/* Questions */}
        <div className="space-y-3">
          {filteredQs.map((q, i) => {
            const isOpen    = openQ === q.id
            const isAnswered = !!answers[q.id]?.trim()

            return (
              <div key={q.id}
                className="bg-[#161616] border rounded-2xl overflow-hidden transition-all"
                style={{ borderColor: isOpen ? cfg.border : 'rgba(255,255,255,0.06)' }}>

                {/* Question header */}
                <button
                  onClick={() => setOpenQ(isOpen ? null : q.id)}
                  className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-black flex-shrink-0"
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                      {i + 1}
                    </span>
                    {isAnswered && <CheckCircle2 size={13} className="text-[#22C55E]"/>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium leading-relaxed text-left">{q.question}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-mono font-bold" style={{ color: DIFFICULTY_COLOR[q.difficulty] ?? '#888' }}>
                        {q.difficulty}
                      </span>
                    </div>
                  </div>

                  <ChevronDown size={14} className={`text-[#333333] flex-shrink-0 mt-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}/>
                </button>

                {/* Question body */}
                {isOpen && (
                  <div className="px-5 pb-5 space-y-4 border-t border-[rgba(255,255,255,0.04)]">

                    {/* Hint */}
                    <div>
                      <button
                        onClick={() => setShowHint(h => ({ ...h, [q.id]: !h[q.id] }))}
                        className="flex items-center gap-1.5 text-[10px] font-mono text-[#444444] hover:text-[#C8F135] transition-colors mt-3"
                      >
                        <Lightbulb size={11}/>{showHint[q.id] ? 'Hide hint' : 'Show hint'}
                      </button>
                      {showHint[q.id] && (
                        <div className="mt-2 bg-[rgba(200,241,53,0.04)] border border-[rgba(200,241,53,0.1)] rounded-xl p-3">
                          <p className="text-xs text-[rgba(200,241,53,0.8)] leading-relaxed">{q.hint}</p>
                        </div>
                      )}
                    </div>

                    {/* Answer textarea */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-[#444444] uppercase tracking-wider">
                        Your answer
                      </label>
                      <textarea
                        rows={mockMode ? 4 : 5}
                        value={answers[q.id] ?? ''}
                        onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                        onBlur={() => saveAnswer(q.id)}
                        placeholder="Type your answer here — it auto-saves when you click away..."
                        className="w-full px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111111] text-sm text-white placeholder:text-[#2a2a2a] resize-none focus:outline-none focus:border-[rgba(255,255,255,0.15)] transition-colors"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#333333] font-mono">
                          {(answers[q.id] ?? '').length} chars
                        </span>
                        <button
                          onClick={() => saveAnswer(q.id)}
                          disabled={saving === q.id || !answers[q.id]?.trim()}
                          className="text-[10px] font-mono text-[#C8F135] hover:opacity-80 disabled:opacity-30 transition-opacity"
                        >
                          {saving === q.id ? 'Saving…' : '✓ Save answer'}
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 flex items-center justify-between p-4 bg-[#161616] border border-[rgba(255,255,255,0.06)] rounded-2xl">
          <div>
            <p className="text-sm font-bold text-white">{answeredCount} of {questions.length} answered</p>
            <p className="text-xs text-[#555555] mt-0.5">Answers auto-save as you type</p>
          </div>
          <button
            onClick={() => router.push(`/dashboard/results/${scanId}`)}
            className="px-4 py-2.5 bg-[#C8F135] text-[#111] font-black text-xs rounded-xl hover:bg-[#d4f54a] transition-colors"
          >
            Back to results →
          </button>
        </div>

      </div>
    </div>
  )
}