'use client'

import { Suspense } from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { loginSchema, LoginInput } from '@/validations/schemas'

// ── Inner component that uses useSearchParams ──
function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl  = searchParams.get('callbackUrl') || '/dashboard'

  const [showPassword, setShowPassword] = useState(false)
  const [serverError,  setServerError]  = useState('')
  const [isLoading,    setIsLoading]    = useState(false)
  const [isGoogleLoad, setIsGoogleLoad] = useState(false)

  const { register, handleSubmit, formState: { errors } } =
    useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginInput) {
    setIsLoading(true)
    setServerError('')
    const res = await signIn('credentials', {
      email: data.email, password: data.password, redirect: false,
    })
    setIsLoading(false)
    if (res?.error) { setServerError('Invalid email or password. Please try again.'); return }
    router.push(callbackUrl)
    router.refresh()
  }

  async function handleGoogle() {
  setIsGoogleLoad(true)
  await signIn('google', {
    callbackUrl: '/dashboard',
    redirect:    true,
  })
}

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* ── LEFT PANEL ── */}
      <div className="relative md:w-[45%] bg-[#111111] flex flex-col p-8 md:p-10 min-h-[300px] md:min-h-screen overflow-hidden">
        <RadarBg />

        <div className="relative z-10 flex items-center gap-2.5 mb-auto">
          <div className="w-9 h-9 rounded-full border-2 border-[#C8F135] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="2.5" fill="#C8F135"/>
              <circle cx="10" cy="10" r="6"   stroke="#C8F135" strokeWidth="1.5" fill="none"/>
              <circle cx="10" cy="10" r="9"   stroke="#C8F135" strokeWidth="1"   fill="none" opacity="0.4"/>
            </svg>
          </div>
          <span className="font-bold text-lg text-white tracking-tight">ResumeRadar</span>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <h2 className="text-5xl md:text-6xl font-black text-white leading-[1.0] tracking-tight mb-3">
            Resume<br />Radar
          </h2>
          <div className="w-16 h-1 bg-[#C8F135] rounded-full mb-6" />
          <p className="text-sm text-[#888888] leading-relaxed mb-8 max-w-xs">
            Know exactly where your resume stands.
          </p>
          <div className="border border-[#2a2a2a] rounded-xl p-5 max-w-[260px]">
            <div className="font-mono text-3xl font-bold text-[#C8F135] mb-1">2,400+</div>
            <div className="text-xs text-[#666666] font-mono leading-relaxed">
              resumes analysed<br />this week alone
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-[#555555] font-mono">No resume stored. Your data stays yours.</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="md:w-[55%] bg-[#F5F4F0] flex flex-col">
        <div className="flex justify-end p-6 md:p-8">
          <p className="text-sm text-[#666666]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-[#111111] underline underline-offset-2">
              Sign up free →
            </Link>
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-10">
          <div className="w-full max-w-[440px] space-y-5">
            <div className="mb-6">
              <h1 className="text-3xl font-black text-[#111111] tracking-tight mb-1">Welcome back</h1>
              <p className="text-sm text-[#666666]">Enter your details to continue your analysis.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#111111]">Email ID</label>
                <input type="email" placeholder="riya.sharma@gmail.com"
                  className={inputCls(!!errors.email)} {...register('email')}/>
                {errors.email && <FieldError msg={errors.email.message!}/>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#111111]">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} placeholder="Your password"
                    className={inputCls(!!errors.password) + ' pr-10'} {...register('password')}/>
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#111]">
                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                {errors.password && <FieldError msg={errors.password.message!}/>}
                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-xs text-[#666666] underline underline-offset-2 hover:text-[#111]">
                    Forgot password?
                  </Link>
                </div>
              </div>

              {serverError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                  {serverError}
                </div>
              )}

              <button type="submit" disabled={isLoading}
                className="w-full py-3.5 bg-[#C8F135] text-[#111111] font-black text-base rounded-xl hover:bg-[#d4f54a] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? 'Signing in…' : 'Log in →'}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#DDDDDD]"/>
              <span className="text-xs text-[#999999] font-mono tracking-widest uppercase">or continue with</span>
              <div className="flex-1 h-px bg-[#DDDDDD]"/>
            </div>

            <button onClick={handleGoogle} disabled={isGoogleLoad}
              className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-[#DDDDDD] bg-white text-[#111111] text-sm font-semibold hover:bg-[#F5F4F0] transition-colors disabled:opacity-50">
              {isGoogleLoad
                ? <span className="w-4 h-4 border-2 border-[#111] border-t-transparent rounded-full animate-spin"/>
                : <GoogleIcon/>}
              Continue with Google
            </button>

            <p className="text-xs text-center text-[#999999]">
              By logging in you agree to our{' '}
              <Link href="/terms" className="underline text-[#666]">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="underline text-[#666]">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page export wrapped in Suspense ──
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C8F135] border-t-transparent rounded-full animate-spin"/>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

/* ── Helpers ── */
const inputCls = (hasError: boolean) =>
  `w-full h-12 px-4 rounded-xl border text-sm text-[#111111] bg-white placeholder:text-[#BBBBBB] transition-all focus:outline-none focus:ring-2 ${
    hasError ? 'border-red-400 focus:ring-red-100' : 'border-[#E0E0E0] focus:border-[#111111] focus:ring-[rgba(0,0,0,0.06)]'
  }`

function FieldError({ msg }: { msg: string }) {
  return <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{msg}</p>
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
    </svg>
  )
}

function RadarBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20"
        width="500" height="500" viewBox="0 0 500 500">
        {[50, 100, 155, 210, 270].map((r) => (
          <circle key={r} cx="250" cy="250" r={r} fill="none" stroke="#C8F135" strokeWidth="0.8"/>
        ))}
        {[0, 1, 2].map((i) => (
          <circle key={i} cx="250" cy="250" r="200" fill="none" stroke="#C8F135" strokeWidth="1"
            style={{ animation: `radarPing 3s ease-out ${i}s infinite`, transformOrigin: '250px 250px', opacity: 0 }}/>
        ))}
      </svg>
      <style>{`
        @keyframes radarPing {
          0%   { transform: scale(0.3); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
