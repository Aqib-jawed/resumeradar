<div align="center">

<img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" />
<img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript" />
<img src="https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma" />
<img src="https://img.shields.io/badge/Groq-llama--3.3--70b-F55036?style=flat-square" />
<img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase" />
<img src="https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel" />

<br/><br/>

```
██████╗ ███████╗███████╗██╗   ██╗███╗   ███╗███████╗
██╔══██╗██╔════╝██╔════╝██║   ██║████╗ ████║██╔════╝
██████╔╝█████╗  ███████╗██║   ██║██╔████╔██║█████╗  
██╔══██╗██╔══╝  ╚════██║██║   ██║██║╚██╔╝██║██╔══╝  
██║  ██║███████╗███████║╚██████╔╝██║ ╚═╝ ██║███████╗
╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝
██████╗  █████╗ ██████╗  █████╗ ██████╗              
██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔══██╗             
██████╔╝███████║██║  ██║███████║██████╔╝             
██╔══██╗██╔══██║██║  ██║██╔══██║██╔══██╗             
██║  ██║██║  ██║██████╔╝██║  ██║██║  ██║             
╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝             
```

### *Know exactly why your resume is being rejected — before you apply.*

**AI-powered ATS intelligence platform built for the Indian job market.**  
Section-by-section analysis · Keyword gap maps · Before/after rewrites · Ghost Mode · Interview Prep

<br/>

[**Live Demo**](https://resumeradar-evys-lf6fngrzp-aqib-jaweds-projects.vercel.app) · [**Report Bug**](https://github.com/Aqib-jawed/resumeradar/issues) · [**Request Feature**](https://github.com/Aqib-jawed/resumeradar/issues)

<br/>

```
┌─────────────────────────────────────────────────────────────────┐
│  2,400+ resumes analysed  ·  +68 avg score improvement  ·  Free │
└─────────────────────────────────────────────────────────────────┘
```

</div>

---

## The Problem

Most Indian job seekers apply to dozens of companies on Naukri, LinkedIn, and Internshala — and hear nothing back. The reason is almost never their qualifications.

It's that their resume never makes it past the ATS.

Every company uses an Applicant Tracking System that filters resumes before a human ever sees them. These systems scan for specific keywords, formatting signals, and section completeness — and they silently reject resumes that don't match. Existing tools give generic advice like *"add more keywords"* or *"use bullet points."*

They don't understand the Indian job market. They don't know whether you're applying to a startup or an MNC. They don't tell you *what specifically* needs to change and *why.*

**ResumeRadar is built to fix exactly this.**

---

## Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [AI Pipeline](#ai-pipeline)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)

---

## Features

### Core Analysis Engine

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SCAN PIPELINE                                │
│                                                                     │
│  PDF Upload → Text Extraction → Groq AI → Structured JSON → DB     │
│                                                                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────┐  │
│  │  pdf2json │ →  │ Resume   │ →  │  llama   │ →  │  PostgreSQL  │  │
│  │ (Node.js) │    │  Text    │    │ 3.3-70b  │    │   (JSONB)    │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

| Feature | Description |
|---------|-------------|
| **ATS Score Engine** | Weighted 0–100 score across keyword match (35pts), section completeness (25pts), formatting signals (15pts), action verb quality (10pts), and quantification (15pts) |
| **Section-wise Analysis** | Every section of your resume — contact, summary, experience, education, skills, projects, achievements — graded 1–10 with specific issues and suggested rewrites |
| **Keyword Gap Map** | Three-column analysis: matched keywords (green), missing keywords (red), bonus keywords (lime). Pre-calculated overlap percentage used to calibrate AI scoring |
| **Before / After Rewriter** | Every weak bullet shown with an AI-rewritten version. One-click copy. References actual text from your resume — not generic examples |
| **India-specific Flags** | Detects photo, DOB, marital status, father's name, home address, religious information, and campus email — flags that hurt ATS compatibility in the Indian market |
| **Roast Mode** | Toggle between polite suggestions and brutally honest feedback. Calls out vague claims, filler words, and unquantified bullets with zero mercy |

### Standout Features

#### 👻 Ghost Mode
Reverse-engineer the perfect candidate profile for any job description — without uploading your resume. Paste a JD and instantly see:
- Must-have vs nice-to-have skills
- Key phrases to include verbatim
- Phrases that signal a weak candidate
- Salary estimate for the Indian market (LPA range)
- Company culture decoded from JD language
- Instant rejection triggers

#### 🎯 JD Decoder
Paste any job description and separate signal from noise:
- **MUST HAVE** vs **PREFERRED** vs **FILLER** requirements classified
- Red flags with severity ratings (high/medium/low)
- Hidden signals the JD implies but doesn't say
- Growth potential and tech debt assessment
- Apply or not verdict with reasoning

#### 🎤 Interview Prep Engine
20 questions generated from your actual resume gaps vs the JD — not generic questions:
- **Technical** — core skills from the JD
- **Gap-Based** — directly targeting your identified weaknesses
- **Behavioral** — STAR format, role-specific
- **Culture Fit** — working style and values alignment
- **Trick** — gotcha questions interviewers love for this role
- Mock interview mode with countdown timer
- Auto-saving answer scratchpad

#### 📈 Score Timeline
Track ATS score improvement across every scan. Recharts line chart with data points per company and role. Shows average improvement and best score achieved.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RESUMERADAR ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   CLIENT (Browser)                                                          │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  Next.js 14 App Router  ·  React  ·  Tailwind CSS  ·  Recharts     │  │
│   │  Zustand (client state)  ·  React Hook Form  ·  Zod validation     │  │
│   └──────────────────────────────┬──────────────────────────────────────┘  │
│                                  │ HTTPS                                    │
│   NEXT.JS SERVER (Vercel Edge)   │                                          │
│   ┌──────────────────────────────▼──────────────────────────────────────┐  │
│   │                                                                     │  │
│   │  ┌─────────────────┐   ┌──────────────────┐   ┌─────────────────┐  │  │
│   │  │   API Routes    │   │   NextAuth.js    │   │   Middleware    │  │  │
│   │  │                 │   │                  │   │                 │  │  │
│   │  │  /scan/upload   │   │  JWT sessions    │   │  Route guard    │  │  │
│   │  │  /scan/create   │   │  Google OAuth    │   │  Rate limiting  │  │  │
│   │  │  /ghost-mode    │   │  Credentials     │   │  Auth check     │  │  │
│   │  │  /jd-decoder    │   └──────────────────┘   └─────────────────┘  │  │
│   │  │  /interview/*   │                                                │  │
│   │  └────────┬────────┘                                                │  │
│   │           │                                                         │  │
│   │  ┌────────▼────────┐   ┌──────────────────┐                        │  │
│   │  │   Prisma ORM    │   │  scanProcessor   │                        │  │
│   │  │                 │   │  (Background)    │                        │  │
│   │  │  Type-safe DB   │   │                  │                        │  │
│   │  │  queries        │   │  pdf2json        │                        │  │
│   │  │  JSONB support  │   │  → Groq API      │                        │  │
│   │  └────────┬────────┘   │  → Parse JSON    │                        │  │
│   │           │            │  → Save to DB    │                        │  │
│   └───────────┼────────────┴──────────────────┴────────────────────────┘  │
│               │                                                             │
│   EXTERNAL SERVICES                                                         │
│   ┌───────────▼──────────────────────────────────────────────────────────┐ │
│   │                                                                      │ │
│   │  ┌──────────────┐  ┌─────────────────┐  ┌────────────────────────┐  │ │
│   │  │   Supabase   │  │   Groq API      │  │   Google OAuth         │  │ │
│   │  │              │  │                 │  │                        │  │ │
│   │  │  PostgreSQL  │  │  llama-3.3-70b  │  │  console.cloud.google  │  │ │
│   │  │  Storage     │  │  versatile      │  │                        │  │ │
│   │  │  (resumes/)  │  │  JSON mode      │  └────────────────────────┘  │ │
│   │  └──────────────┘  └─────────────────┘                              │ │
│   └──────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Request Flow — Resume Scan

```
User submits JD + PDF
        │
        ▼
POST /api/scan/upload
  · Validate PDF magic bytes (%PDF header)
  · Check file size (max 5MB)
  · Upload to Supabase Storage → return storage key
        │
        ▼
POST /api/scan/create
  · Create Scan record (status: PENDING)
  · Detect company type (MNC / Startup / PSU / Government)
  · Fire processScan() asynchronously
  · Return scanId immediately → client begins polling
        │
        ▼
processScan() [Background]
  · Download PDF from Supabase Storage
  · Extract text via pdf2json (page-by-page, correct order)
  · Pre-calculate keyword overlap % (JD words ∩ resume words)
  · Build structured prompt with overlap as scoring baseline
  · Call Groq API (llama-3.3-70b-versatile, temp=0.1)
  · Parse + validate JSON response
  · Enforce score integrity (atsScore = sum of breakdown)
  · Clamp section grades (1–10)
  · Save to DB (status: COMPLETE)
        │
        ▼
GET /api/scan/[id]/status (polling every 3s)
  · Returns PENDING → PROCESSING → COMPLETE
        │
        ▼
GET /api/scan/[id]/results
  · Returns full scan data including resumeSections JSONB
        │
        ▼
Results page renders with animation
```

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14.2 | App Router, SSR, API routes |
| TypeScript | 5.x | Type safety throughout |
| Tailwind CSS | 3.x | Utility-first styling |
| Recharts | 2.x | Score timeline chart |
| React Hook Form | 7.x | Form state management |
| Zod | 3.x | Schema validation (client + server) |
| Lucide React | 0.x | Icon system |

### Backend & Infrastructure
| Technology | Version | Purpose |
|-----------|---------|---------|
| Prisma ORM | 5.22 | Type-safe database client |
| NextAuth.js | 4.x | Authentication (JWT + OAuth) |
| pdf2json | 3.x | PDF text extraction (Windows-compatible) |
| bcryptjs | 2.x | Password hashing (12 rounds) |

### AI & Data
| Technology | Purpose |
|-----------|---------|
| Groq API | LLM inference (free tier) |
| llama-3.3-70b-versatile | Resume analysis model |
| Supabase PostgreSQL | Primary database with JSONB |
| Supabase Storage | PDF file storage (private bucket) |

### DevOps
| Technology | Purpose |
|-----------|---------|
| Vercel | Deployment + edge functions |
| GitHub Actions | CI/CD (via Vercel integration) |

---

## AI Pipeline

### Scoring Methodology

The ATS score is not a single model output — it's an **engineered scoring function** with pre-calculated signals fed to the LLM as constraints:

```typescript
// Pre-calculate keyword overlap BEFORE calling the AI
const jdWordSet     = new Set(jobDescription.match(/\b\w{4,}\b/g))
const resumeWordSet = new Set(resumeText.match(/\b\w{4,}\b/g))
const overlap       = [...jdWordSet].filter(w => resumeWordSet.has(w))
const overlapPct    = (overlap.length / jdWordSet.size) * 100

// Feed this as a hard constraint to the prompt
// "keywordMatch baseline = Math.round(overlapPct * 0.35)"
// This prevents the model from defaulting to 85
```

**Score breakdown:**

```
┌─────────────────────────────────────────────────────┐
│           ATS SCORE COMPOSITION (0-100)             │
├─────────────────────────┬───────────────────────────┤
│ Keyword Match           │ 0 – 35 pts                │
│ Section Completeness    │ 0 – 25 pts                │
│ Formatting Signals      │ 0 – 15 pts                │
│ Action Verb Quality     │ 0 – 10 pts                │
│ Quantification          │ 0 – 15 pts                │
├─────────────────────────┴───────────────────────────┤
│ Total                   │ 0 – 100 pts               │
└─────────────────────────────────────────────────────┘
```

**Section grades (1-10):**

```
9-10  Exceptional — perfectly tailored to this JD
7-8   Strong — minor gaps only
5-6   Average — noticeable gaps
3-4   Weak — significant issues
1-2   Very poor or missing
```

### Prompt Engineering Decisions

| Decision | Reasoning |
|---------|-----------|
| `temperature: 0.1` | Near-deterministic output for consistent JSON structure |
| `max_tokens: 4000` | Enough for full resumeSections JSONB including all bullets |
| Pre-calculated overlap in system prompt | Prevents model from ignoring keyword data and defaulting to ~85 |
| Score integrity enforcement post-parse | `atsScore = km + sc + fs + av + qu` always recalculated in code |
| Verbatim extraction instruction | Forces model to copy actual resume text instead of hallucinating |

---

## Database Schema

```prisma
model User {
  id             String    @id @default(cuid())
  email          String    @unique
  hashedPassword String?           // null for OAuth users
  plan           Plan      @default(FREE)
  scansUsed      Int       @default(0)

  scans             Scan[]
  ghostSessions     GhostSession[]
  interviewSessions InterviewSession[]
}

model Scan {
  id             String      @id @default(cuid())
  userId         String
  jobTitle       String
  companyName    String
  companyType    CompanyType          // STARTUP | MNC | PSU | GOVERNMENT
  jobDescription String
  resumeS3Key    String?
  status         ScanStatus           // PENDING | PROCESSING | COMPLETE | FAILED

  // AI results stored as JSONB — flexible schema for AI output
  atsScore       Int?
  scoreBreakdown Json?                // { keywordMatch, sectionCompleteness, ... }
  sectionGrades  Json?                // { education: 7, skills: 8, ... }
  keywords       Json?                // { matched: [], missing: [], bonus: [] }
  suggestions    Json?                // [{ section, issue, fix, impact, before, after }]
  indiaFlags     Json?                // [{ type, message, severity }]
  roastMode      Json?                // { summary, bullets[] }
  resumeSections Json?                // Full section-by-section breakdown

  interviewSession InterviewSession?
}

model GhostSession {
  id             String  @id @default(cuid())
  userId         String
  jobDescription String
  ghostProfile   Json?   // Full ideal candidate profile
  gapScore       Int?
}

model InterviewSession {
  id        String              @id @default(cuid())
  scanId    String              @unique
  questions InterviewQuestion[]
}

model InterviewQuestion {
  id         String  @id @default(cuid())
  sessionId  String
  category   String  // Technical | Gap-Based | Behavioral | Culture Fit | Trick
  difficulty String  // Easy | Medium | Hard
  question   String
  hint       String?
  answer     String? // User's saved answer
  order      Int
}
```

**Key design decisions:**
- `resumeSections` stored as JSONB — AI output schema can evolve without migrations
- `resumeS3Key` stores Supabase Storage path, not full URL — URLs are generated at read time
- `InterviewSession` linked 1:1 to `Scan` — questions are regenerated per scan, not reused
- All AI results nullable — scan can be queried while processing

---

## Project Structure

```
resumeradar/
│
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Auth route group (no layout)
│   │   ├── login/page.tsx        # Login with Suspense boundary
│   │   ├── register/page.tsx     # Register with password strength meter
│   │   └── forgot-password/      # Password reset flow
│   │
│   ├── (dashboard)/              # Protected dashboard route group
│   │   ├── layout.tsx            # Sidebar + auth guard
│   │   ├── dashboard/
│   │   │   ├── page.tsx          # New scan wizard (3-step)
│   │   │   └── results/[scanId]/ # Full ATS analysis results
│   │   ├── ghost-mode/           # JD reverse-engineering
│   │   ├── jd-decoder/           # JD signal/noise separation
│   │   ├── interview-prep/       # 20-question prep per scan
│   │   ├── scans/                # Score timeline + scan history
│   │   └── history/              # Redirects → /scans
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/    # NextAuth handler
│   │   │   └── register/         # Custom registration endpoint
│   │   ├── scan/
│   │   │   ├── upload/           # PDF validation + Supabase upload
│   │   │   ├── create/           # Scan record + async processor
│   │   │   └── [scanId]/
│   │   │       ├── status/       # Polling endpoint
│   │   │       └── results/      # Full scan data
│   │   ├── ghost-mode/           # Ghost profile generation
│   │   ├── jd-decoder/           # JD decoding
│   │   └── interview/
│   │       ├── generate/         # 20-question generation
│   │       └── [questionId]/answer/ # Answer persistence
│   │
│   ├── error.tsx                 # Global error boundary
│   ├── not-found.tsx             # 404 page
│   ├── layout.tsx                # Root layout + SessionProvider
│   ├── page.tsx                  # Root → redirect by session
│   └── providers.tsx             # Client providers
│
├── components/
│   ├── ui/                       # Design system primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── RadarAnimation.tsx    # SVG radar with ping animation
│   │   ├── SplitLayout.tsx       # Auth page two-panel shell
│   │   └── index.ts              # Barrel export
│   ├── auth/
│   │   └── PasswordStrengthMeter.tsx
│   ├── dashboard/
│   │   ├── Sidebar.tsx           # Nav + user block + sign out
│   │   ├── ScanWizard.tsx        # 3-step scan flow
│   │   └── ScansClient.tsx       # Score timeline (Recharts)
│   └── landing/
│       └── LandingPage.tsx       # Full marketing page
│
├── lib/
│   ├── auth.ts                   # NextAuth config (JWT + Google + Credentials)
│   ├── prisma.ts                 # Prisma singleton (dev hot-reload safe)
│   ├── supabase.ts               # Supabase admin + anon clients
│   ├── groq.ts                   # Groq client + model constant
│   └── rateLimit.ts              # In-memory rate limiter
│
├── workers/
│   └── scanProcessor.ts          # PDF extraction + Groq AI + DB save
│
├── types/
│   ├── index.ts                  # Domain types (ScanResult, Suggestion, etc.)
│   └── next-auth.d.ts            # Session type augmentation
│
├── validations/
│   └── schemas.ts                # Zod schemas (register, login, scan)
│
├── prisma/
│   └── schema.prisma             # Full database schema
│
├── middleware.ts                 # Route protection + auth guard
├── next.config.js                # pdf2json externals + security headers
├── tailwind.config.ts            # Design token extensions
└── .env.example                  # Environment variable template
```

---

## Getting Started

### Prerequisites

```bash
node --version   # v18.x or higher
npm --version    # v9.x or higher
```

### 1. Clone the repository

```bash
git clone https://github.com/Aqib-jawed/resumeradar.git
cd resumeradar
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in all values — see [Environment Variables](#environment-variables) below.

### 4. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to your Supabase database
npx prisma db push

# Verify tables in Prisma Studio
npx prisma studio
```

You should see 7 tables: `User`, `Account`, `Session`, `Scan`, `GhostSession`, `InterviewSession`, `InterviewQuestion`.

### 5. Set up Supabase Storage

1. Go to Supabase dashboard → **Storage**
2. Create a new **private** bucket named `resumes`
3. Add this storage policy in SQL Editor:

```sql
CREATE POLICY "Users manage own resumes"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

```env
# ── DATABASE (Supabase Transaction Pooler) ─────────────────────────
# Use Transaction Pooler URL — direct connection (port 5432) is blocked on Vercel
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# ── NEXTAUTH ───────────────────────────────────────────────────────
NEXTAUTH_URL="http://localhost:3000"
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
NEXTAUTH_SECRET="your-32-byte-random-secret"

# ── GOOGLE OAUTH ───────────────────────────────────────────────────
# Get from: console.cloud.google.com → APIs & Services → Credentials
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# ── GROQ API (free tier available) ────────────────────────────────
# Get from: console.groq.com → API Keys
GROQ_API_KEY=""

# ── SUPABASE ───────────────────────────────────────────────────────
# Get from: Supabase → Settings → API
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""

# ── REDIS (optional — for job queue) ──────────────────────────────
# Get from: upstash.com → Create Database
REDIS_URL=""
```

---

## Deployment

### Deploy to Vercel

**1. Push to GitHub**
```bash
git add .
git commit -m "feat: initial deploy"
git push origin main
```

**2. Import project on Vercel**
- Go to [vercel.com/new](https://vercel.com/new)
- Import your GitHub repository
- Framework: Next.js (auto-detected)

**3. Add environment variables**

In Vercel → Settings → Environment Variables, add all keys from `.env.example`.

> ⚠️ **Critical:** Use the **Transaction Pooler** URL for `DATABASE_URL` (port 6543), not the direct connection (port 5432). Vercel's network blocks port 5432.

**4. Update Google OAuth**

In [console.cloud.google.com](https://console.cloud.google.com) → Credentials → your OAuth client:
- Authorised JavaScript origins: `https://your-app.vercel.app`
- Authorised redirect URIs: `https://your-app.vercel.app/api/auth/callback/google`

**5. Redeploy**

After updating env vars: Vercel → Deployments → Latest → ⋯ → Redeploy

### Build script

The `package.json` build script runs Prisma generation before Next.js build — required for Vercel's dependency caching:

```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

---

## Screenshots

> *Landing page · Register · Dashboard · Results · Ghost Mode · Interview Prep*

```
┌─────────────────────────┐   ┌─────────────────────────┐
│  🏠 Landing Page        │   │  📊 Results Dashboard   │
│                         │   │                         │
│  "Your resume has been  │   │  ATS Score: 67/100       │
│  losing you jobs."      │   │  ████████░░░░  67%       │
│                         │   │                         │
│  [Analyse my resume →]  │   │  Education  ████  8/10  │
│                         │   │  Skills     ███   7/10  │
│  Dark left panel with   │   │  Experience ██    5/10  │
│  radar animation        │   │  Projects   ████  8/10  │
└─────────────────────────┘   └─────────────────────────┘

┌─────────────────────────┐   ┌─────────────────────────┐
│  👻 Ghost Mode          │   │  🎤 Interview Prep      │
│                         │   │                         │
│  Must-have skills:      │   │  Technical  [4/4] ████  │
│  ● Python               │   │  Gap-Based  [2/4] ██░░  │
│  ● SQL                  │   │  Behavioral [0/4] ░░░░  │
│  ● Spark                │   │                         │
│                         │   │  Q: "Explain your       │
│  Salary: 12-18 LPA      │   │  approach to designing  │
│  Verdict: Strong Yes ✓  │   │  distributed systems"   │
└─────────────────────────┘   └─────────────────────────┘
```

---

## Roadmap

- [x] ATS score engine with section-wise breakdown
- [x] PDF text extraction (pdf2json, Windows-compatible)
- [x] Section-by-section analysis with real resume content
- [x] Ghost Mode — ideal candidate profile from any JD
- [x] JD Decoder — signal vs noise classification
- [x] Interview Prep — 20 gap-based questions per scan
- [x] Score Timeline — Recharts line chart across all scans
- [x] India-specific flags (photo, DOB, address, campus email)
- [x] Roast Mode — brutal honest feedback toggle
- [x] Google OAuth + credentials auth
- [x] Vercel deployment with Supabase Transaction Pooler
- [ ] Razorpay integration (Pro plan)
- [ ] Resume PDF export with applied suggestions
- [ ] Bulk scan comparison (side-by-side two resumes)
- [ ] LinkedIn profile analysis (URL input)
- [ ] WhatsApp notification when scan completes
- [ ] Hindi language support

---

## Contributing

```bash
# Fork the repo
# Create your feature branch
git checkout -b feature/AmazingFeature

# Commit your changes
git commit -m 'feat: add AmazingFeature'

# Push to the branch
git push origin feature/AmazingFeature

# Open a Pull Request
```

Please make sure to update tests as appropriate and follow the existing code style.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

**Built for the Indian job market 🇮🇳**

Made with ⚡ by [Aqib Jawed](https://github.com/Aqib-jawed)

*B.Tech CSE · GITAM University · Graduating May 2027*

<br/>

```
If this project helped you land an interview — star it ⭐
```

[![GitHub stars](https://img.shields.io/github/stars/Aqib-jawed/resumeradar?style=social)](https://github.com/Aqib-jawed/resumeradar)

</div>
