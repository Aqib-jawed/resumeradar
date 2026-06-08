# ResumeRadar

AI-powered ATS resume intelligence platform for the Indian job market.

## What it does

ResumeRadar analyses your resume against a specific job description and tells you:
- Your ATS score (0–100) with section-wise breakdown
- Exactly which keywords are matched, missing, and bonus
- Section-by-section analysis with real content from your resume
- Before/after AI rewrites for every weak bullet
- India-specific warnings (photo, DOB, address, campus email)
- Ghost Mode — reverse-engineer the ideal candidate profile from any JD
- JD Decoder — separate real requirements from filler, detect red flags
- Interview Prep — 20 questions tailored to your specific resume gaps

## Tech stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **AI**: Groq API (llama-3.3-70b-versatile)
- **Storage**: Supabase Storage
- **Auth**: NextAuth.js (credentials + Google OAuth)
- **PDF parsing**: pdf2json

## Local setup

### 1. Clone and install

\`\`\`bash
git clone https://github.com/your-username/resumeradar.git
cd resumeradar
npm install
\`\`\`

### 2. Environment variables

\`\`\`bash
cp .env.example .env.local
\`\`\`

Fill in all values in `.env.local` — see comments for where to get each one.

### 3. Database setup

\`\`\`bash
npx prisma generate
npx prisma db push
\`\`\`

### 4. Supabase Storage

Create a private bucket called `resumes` in your Supabase project under Storage.

### 5. Run

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Connect repo to Vercel
3. Add all env vars from `.env.local` to Vercel dashboard
4. Deploy

\`\`\`bash
git add .
git commit -m "feat: initial deploy"
git push
\`\`\`

## Project structure

\`\`\`
resumeradar/
├── app/
│   ├── (auth)/          # Login, register pages
│   ├── (dashboard)/     # All dashboard pages
│   ├── api/             # API routes
│   └── ...
├── components/
│   ├── auth/            # Auth components
│   ├── dashboard/       # Dashboard components
│   ├── landing/         # Landing page
│   └── ui/              # Reusable UI components
├── lib/                 # Prisma, Groq, Supabase, auth config
├── prisma/              # Schema
├── types/               # TypeScript types
├── validations/         # Zod schemas
└── workers/             # AI scan processor
\`\`\`