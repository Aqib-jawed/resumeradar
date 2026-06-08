import { z } from 'zod'

// ── Auth schemas ──────────────────────────────────────────────
export const registerSchema = z.object({
  name: z
    .string()
    .min(2,  'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .trim(),
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8,  'Password must be at least 8 characters')
    .max(72, 'Password too long')
    .regex(/[A-Z]/,       'Must contain at least one uppercase letter')
    .regex(/[0-9]/,       'Must contain at least one number'),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Passwords do not match', path: ['confirmPassword'] }
)

export const loginSchema = z.object({
  email:    z.string().email('Invalid email').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email').toLowerCase().trim(),
})

export const resetPasswordSchema = z.object({
  token:           z.string().min(1),
  password:        z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Passwords do not match', path: ['confirmPassword'] }
)

// ── Scan schemas ──────────────────────────────────────────────
export const scanCreateSchema = z.object({
  jobTitle:       z.string().min(2).max(100).trim(),
  companyName:    z.string().min(1).max(100).trim(),
  jobDescription: z.string().min(50, 'Please paste the full job description').max(10000),
  resumeS3Key:    z.string().min(1, 'Resume upload required'),
})

// ── Inferred types ────────────────────────────────────────────
export type RegisterInput       = z.infer<typeof registerSchema>
export type LoginInput          = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput  = z.infer<typeof resetPasswordSchema>
export type ScanCreateInput     = z.infer<typeof scanCreateSchema>