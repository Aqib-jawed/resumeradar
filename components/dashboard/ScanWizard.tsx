'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { Upload, FileText, X, Briefcase, Link as LinkIcon, Loader2 } from 'lucide-react'

const step1Schema = z.object({
  jobTitle:       z.string().min(2, 'Job title is required'),
  companyName:    z.string().min(1, 'Company name is required'),
  jobDescription: z.string().min(50, 'Please paste the full job description (min 50 characters)'),
})
type Step1Data = z.infer<typeof step1Schema>

type Step = 1 | 2 | 3

export default function ScanWizard() {
  const router = useRouter()
  const [step,       setStep]       = useState<Step>(1)
  const [step1Data,  setStep1Data]  = useState<Step1Data | null>(null)
  const [file,       setFile]       = useState<File | null>(null)
  const [dragOver,   setDragOver]   = useState(false)
  const [uploading,  setUploading]  = useState(false)
  const [error,      setError]      = useState('')

  const [urlMode,    setUrlMode]    = useState(false)
  const [urlValue,   setUrlValue]   = useState('')
  const [scraping,   setScraping]   = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<Step1Data>({ resolver: zodResolver(step1Schema) })

  const jdValue = watch('jobDescription', '')

  /* ── Step 1 submit ── */
  function onStep1(data: Step1Data) {
    setStep1Data(data)
    setStep(2)
  }

  async function handleScrape(e: React.FormEvent) {
    e.preventDefault()
    if (!urlValue) return
    
    setScraping(true)
    setError('')
    
    try {
      const res = await fetch('/api/jd/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlValue })
      })
      
      const json = await res.json()
      
      if (!res.ok || !json.success) {
        setUrlMode(false)
        setError(json.message || 'Could not auto-import this URL. Please paste the job description manually.')
        return
      }
      
      // Auto-fill form
      setValue('jobTitle', json.data.jobTitle, { shouldValidate: true })
      setValue('companyName', json.data.companyName, { shouldValidate: true })
      setValue('jobDescription', json.data.jobDescription, { shouldValidate: true })
      
      setUrlMode(false)
    } catch (err) {
      setUrlMode(false)
      setError('Could not auto-import this URL. Please paste the job description manually.')
    } finally {
      setScraping(false)
    }
  }

  /* ── File handling ── */
  const handleFile = useCallback((f: File) => {
    if (f.type !== 'application/pdf') { setError('Only PDF files are accepted'); return }
    if (f.size > 5 * 1024 * 1024)    { setError('File must be under 5MB'); return }
    setError('')
    setFile(f)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  /* ── Step 2 submit — upload + create scan ── */
  async function onStep2() {
    if (!file || !step1Data) return
    setUploading(true)
    setError('')

    try {
      // 1. Upload PDF
      const form = new FormData()
      form.append('resume', file)
      const uploadRes  = await fetch('/api/scan/upload', { method: 'POST', body: form })
      const uploadJson = await uploadRes.json()
      if (!uploadJson.success) { setError(uploadJson.error); setUploading(false); return }

      // 2. Create scan + enqueue job
      const createRes  = await fetch('/api/scan/create', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...step1Data, resumeS3Key: uploadJson.data.key }),
      })
      const createJson = await createRes.json()
      if (!createJson.success) { setError(createJson.error); setUploading(false); return }

      // 3. Go to processing screen
      setStep(3)
      router.push(`/dashboard/results/${createJson.data.scanId}`)

    } catch {
      setError('Something went wrong. Please try again.')
      setUploading(false)
    }
  }

  /* ── RENDER ── */
  return (
    <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">

      {/* Step indicator */}
      <div className="flex border-b border-[rgba(255,255,255,0.06)]">
        {(['Job details', 'Resume', 'Processing'] as const).map((label, i) => {
          const n = (i + 1) as Step
          const active = step === n
          const done   = step > n
          return (
            <div key={label} className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-semibold font-mono transition-colors ${
              active ? 'text-[#C8F135] border-b-2 border-[#C8F135]' :
              done   ? 'text-[#555555]' : 'text-[#333333]'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                active ? 'bg-[#C8F135] text-[#111111]' :
                done   ? 'bg-[#333333] text-[#555555]' : 'bg-[#222222] text-[#333333]'
              }`}>
                {done ? '✓' : n}
              </span>
              {label}
            </div>
          )
        })}
      </div>

      <div className="p-6 md:p-8">

        {/* ── STEP 1: Job details ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => { setUrlMode(!urlMode); setError(''); }}
                className="text-xs font-semibold text-[#C8F135] hover:underline flex items-center gap-1.5"
              >
                {urlMode ? 'Paste text manually instead' : 'Paste a job URL instead'}
                <LinkIcon size={12} />
              </button>
            </div>

            {error && <Err msg={error} />}

            {urlMode ? (
              <form onSubmit={handleScrape} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Job URL</label>
                  <input
                    type="url"
                    value={urlValue}
                    onChange={(e) => setUrlValue(e.target.value)}
                    placeholder="e.g. https://www.naukri.com/job-listings-..."
                    className={fieldCls(false)}
                    required
                  />
                  <p className="text-[10px] text-[#555555]">Supports Naukri, LinkedIn, Internshala, and Unstop.</p>
                </div>
                
                <button
                  type="submit"
                  disabled={!urlValue || scraping}
                  className="w-full py-3.5 bg-[#C8F135] text-[#111111] font-black text-sm rounded-xl hover:bg-[#d4f54a] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {scraping ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Importing Job Details...
                    </>
                  ) : (
                    'Auto-Import Job Details'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit(onStep1)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Job Title</label>
                    <input
                      placeholder="e.g. Senior Frontend Engineer"
                      className={fieldCls(!!errors.jobTitle)}
                      {...register('jobTitle')}
                    />
                    {errors.jobTitle && <Err msg={errors.jobTitle.message!} />}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Company Name</label>
                    <input
                      placeholder="e.g. Razorpay"
                      className={fieldCls(!!errors.companyName)}
                      {...register('companyName')}
                    />
                    {errors.companyName && <Err msg={errors.companyName.message!} />}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">
                      Job Description
                    </label>
                    <span className="text-xs font-mono text-[#444444]">{jdValue.length} chars</span>
                  </div>
                  <textarea
                    rows={8}
                    placeholder="Paste the full job description here — the more complete it is, the more accurate your ATS analysis will be..."
                    className={`${fieldCls(!!errors.jobDescription)} resize-none`}
                    {...register('jobDescription')}
                  />
                  {errors.jobDescription && <Err msg={errors.jobDescription.message!} />}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#C8F135] text-[#111111] font-black text-sm rounded-xl hover:bg-[#d4f54a] active:scale-[0.98] transition-all"
                >
                  Continue to upload →
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── STEP 2: File upload ── */}
        {step === 2 && (
          <div className="space-y-5">
            <button
              onClick={() => setStep(1)}
              className="text-xs text-[#555555] hover:text-white flex items-center gap-1.5 transition-colors"
            >
              ← Back to job details
            </button>

            {/* Drop zone */}
            <div
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => document.getElementById('resume-input')?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-[#C8F135] bg-[rgba(200,241,53,0.05)]'
                  : file
                  ? 'border-[#C8F135] bg-[rgba(200,241,53,0.03)]'
                  : 'border-[#2a2a2a] hover:border-[#444444]'
              }`}
            >
              <input
                id="resume-input"
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />

              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText size={24} className="text-[#C8F135]" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">{file.name}</p>
                    <p className="text-xs text-[#555555]">{(file.size / 1024).toFixed(0)} KB — PDF</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null) }}
                    className="ml-2 text-[#444444] hover:text-[#FF4D4D] transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={28} className="text-[#333333] mx-auto mb-3" />
                  <p className="text-sm font-semibold text-[#888888]">
                    Drop your resume here or <span className="text-[#C8F135]">browse</span>
                  </p>
                  <p className="text-xs text-[#444444] mt-1">PDF only · Max 5MB</p>
                </>
              )}
            </div>

            {error && <Err msg={error} />}

            <button
              onClick={onStep2}
              disabled={!file || uploading}
              className="w-full py-3.5 bg-[#C8F135] text-[#111111] font-black text-sm rounded-xl hover:bg-[#d4f54a] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
                  Uploading & scanning…
                </span>
              ) : 'Analyse my resume →'}
            </button>
          </div>
        )}

        {/* ── STEP 3: Processing (shown briefly before redirect) ── */}
        {step === 3 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="w-16 h-16 rounded-full border-2 border-[#C8F135] animate-ping absolute opacity-30" />
              <div className="w-16 h-16 rounded-full border-2 border-[#C8F135] flex items-center justify-center relative">
                <Briefcase size={24} className="text-[#C8F135]" />
              </div>
            </div>
            <p className="text-white font-bold text-lg">Redirecting to results…</p>
            <p className="text-[#555555] text-sm mt-1">Your resume is being analysed</p>
          </div>
        )}

      </div>
    </div>
  )
}

/* ── Helpers ── */
const fieldCls = (err: boolean) =>
  `w-full px-4 py-3 rounded-xl border text-sm text-white bg-[#111111] placeholder:text-[#333333] transition-all focus:outline-none focus:ring-2 ${
    err ? 'border-red-500 focus:ring-red-500/20' : 'border-[rgba(255,255,255,0.08)] focus:border-[rgba(255,255,255,0.2)] focus:ring-white/5'
  }`

function Err({ msg }: { msg: string }) {
  return <p className="text-xs text-red-400 flex items-center gap-1">⚠ {msg}</p>
}