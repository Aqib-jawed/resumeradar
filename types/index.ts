import { Plan, ScanStatus, CompanyType } from '@prisma/client'

// ── Auth ─────────────────────────────────────────────────────
export interface AuthUser {
  id:    string
  name:  string
  email: string
  plan:  Plan
}

// ── Scan ─────────────────────────────────────────────────────
export interface ScanResult {
  atsScore:       number
  scoreBreakdown: ScoreBreakdown
  sectionGrades:  SectionGrades
  keywords:       Keywords
  suggestions:    Suggestion[]
  indiaFlags:     IndiaFlag[]
  roastMode:      RoastMode
}

export interface ScoreBreakdown {
  keywordMatch:        number
  sectionCompleteness: number
  formattingSignals:   number
  actionVerbQuality:   number
  quantification:      number
}

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F'

export interface SectionGrades {
  education:  Grade
  skills:     Grade
  experience: Grade
  projects:   Grade
}

export interface Keywords {
  matched: string[]
  missing: string[]
  bonus:   string[]
}

export type ImpactLevel = 'HIGH' | 'MEDIUM' | 'LOW'

export interface Suggestion {
  section:    string
  issue:      string
  fix:        string
  impact:     ImpactLevel
  beforeText: string
  afterText:  string
}

export type IndiaFlagType =
  | 'PHOTO'
  | 'DOB'
  | 'MARITAL_STATUS'
  | 'FATHERS_NAME'
  | 'CAMPUS_EMAIL'

export interface IndiaFlag {
  type:     IndiaFlagType
  message:  string
  severity: 'WARNING'
}

export interface RoastMode {
  summary: string
  bullets: string[]
}

// ── API responses ─────────────────────────────────────────────
export interface ApiSuccess<T> {
  success: true
  data:    T
}

export interface ApiError {
  success: false
  error:   string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError