'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { registerSchema, RegisterInput } from '@/validations/schemas'
import PasswordStrengthMeter from '@/components/auth/PasswordStrengthMeter'

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword,  setShowPassword]  = useState(false)
  const [showConfirm,   setShowConfirm]   = useState(false)
  const [serverError,   setServerError]   = useState('')
  const [isLoading,     setIsLoading]     = useState(false)
  const [isGoogleLoad,  setIsGoogleLoad]  = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } =
    useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  const passwordValue = watch('password', '')

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true)
    setServerError('')
    try {
      const res  = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      })
      const json = await res.json()
      if (!json.success) { setServerError(json.error); return }

      const signInRes = await signIn('credentials', {
        email: data.email, password: data.password, redirect: false,
      })
      if (signInRes?.error) { router.push('/login'); return }
      router.push('/dashboard')
    } catch {
      setServerError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogle() {
  setIsGoogleLoad(true)
  await signIn('google', { callbackUrl: '/dashboard' })
}

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* ── LEFT PANEL ── */}
      <div className="relative md:w-[45%] bg-[#111111] flex flex-col p-8 md:p-10 min-h-[300px] md:min-h-screen overflow-hidden">

        {/* Radar bg */}
        <RadarBg />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5 mb-auto">
          <div className="w-9 h-9 rounded-full border-2 border-accent flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="2.5" fill="#C8F135"/>
              <circle cx="10" cy="10" r="6"   stroke="#C8F135" strokeWidth="1.5" fill="none"/>
              <circle cx="10" cy="10" r="9"   stroke="#C8F135" strokeWidth="1"   fill="none" opacity="0.4"/>
            </svg>
          </div>
          <span className="font-bold text-lg text-white tracking-tight">ResumeRadar</span>
        </div>

        {/* Main left content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.05] tracking-tight mb-6">
            Your resume<br />
            has been<br />
            <span className="text-white">losing you</span><br />
            <span className="text-white">jobs.</span>
          </h2>
          <p className="text-sm text-[#888888] leading-relaxed mb-8 max-w-xs">
            Create your free account. See your ATS score in 2 minutes. No credit card. No fluff.
          </p>
          <div className="space-y-3">
            {[
              'Free first scan — no card needed',
              'Section-by-section fix suggestions',
              'Built for Naukri, LinkedIn and Internshala',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-accent flex-shrink-0" />
                <span className="text-sm text-[#aaaaaa]">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-xs text-[#555555] font-mono">No resume stored. Your data stays yours.</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="md:w-[55%] bg-[#F5F4F0] flex flex-col">

        {/* Top nav */}
        <div className="flex justify-end p-6 md:p-8">
          <p className="text-sm text-[#666666]">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#111111] underline underline-offset-2">
              Log in →
            </Link>
          </p>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center px-6 pb-10">
          <div className="w-full max-w-[440px] space-y-5">

            {/* Heading */}
            <div className="mb-6">
              <h1 className="text-3xl font-black text-[#111111] tracking-tight mb-1">
                Create your account
              </h1>
              <p className="text-sm text-[#666666]">
                Free forever for your first scan. No card needed.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#111111]">Full Name</label>
                <input
                  placeholder="Riya Sharma"
                  className={inputCls(!!errors.name)}
                  {...register('name')}
                />
                {errors.name && <FieldError msg={errors.name.message!} />}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#111111]">Email ID</label>
                <input
                  type="email"
                  placeholder="riya.sharma@gmail.com"
                  className={inputCls(!!errors.email)}
                  {...register('email')}
                />
                {errors.email && <FieldError msg={errors.email.message!} />}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#111111]">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    className={inputCls(!!errors.password) + ' pr-10'}
                    {...register('password')}
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#111]">
                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                <PasswordStrengthMeter password={passwordValue} />
                {errors.password && <FieldError msg={errors.password.message!} />}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#111111]">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    className={inputCls(!!errors.confirmPassword) + ' pr-10'}
                    {...register('confirmPassword')}
                  />
                  <button type="button" onClick={() => setShowConfirm(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#111]">
                    {showConfirm ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                {errors.confirmPassword && <FieldError msg={errors.confirmPassword.message!} />}
              </div>

              {serverError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                  {serverError}
                </div>
              )}

              {/* CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-13 py-3.5 bg-accent text-[#111111] font-black text-base rounded-xl hover:bg-[#d4f54a] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating account…' : 'Create account →'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#DDDDDD]" />
              <span className="text-xs text-[#999999] font-mono tracking-widest uppercase">or continue with</span>
              <div className="flex-1 h-px bg-[#DDDDDD]" />
            </div>

            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={isGoogleLoad}
              className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-[#DDDDDD] bg-white text-[#111111] text-sm font-semibold hover:bg-[#F5F4F0] transition-colors disabled:opacity-50"
            >
              {isGoogleLoad
                ? <span className="w-4 h-4 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
                : <GoogleIcon />}
              Sign up with Google
            </button>

            {/* Terms */}
            <p className="text-xs text-center text-[#999999]">
              By creating an account you agree to our{' '}
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

/* ── Helpers ── */
const inputCls = (hasError: boolean) =>
  `w-full h-12 px-4 rounded-xl border text-sm text-[#111111] bg-white placeholder:text-[#BBBBBB] transition-all focus:outline-none focus:ring-2 ${
    hasError
      ? 'border-red-400 focus:ring-red-100'
      : 'border-[#E0E0E0] focus:border-[#111111] focus:ring-[rgba(0,0,0,0.06)]'
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
          <circle key={r} cx="250" cy="250" r={r}
            fill="none" stroke="#C8F135" strokeWidth="0.8"/>
        ))}
        {[0,1,2].map((i) => (
          <circle key={i} cx="250" cy="250" r="200"
            fill="none" stroke="#C8F135" strokeWidth="1"
            style={{
              animation: `radarPing 3s ease-out ${i * 1}s infinite`,
              transformOrigin: '250px 250px',
              opacity: 0,
            }}
          />
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