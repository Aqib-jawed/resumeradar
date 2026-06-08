import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { groq, GROQ_MODEL } from '@/lib/groq'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id)
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { jobDescription } = await req.json()
    if (!jobDescription || jobDescription.length < 50)
      return NextResponse.json({ success: false, error: 'Please paste a full job description' }, { status: 400 })

    const prompt = `You are an expert career strategist for the Indian job market.

Analyse this job description and reverse-engineer the IDEAL candidate profile.
This is "Ghost Mode" — show the perfect candidate the company is looking for.

JOB DESCRIPTION:
${jobDescription.slice(0, 4000)}

Return ONLY valid JSON:
{
  "roleTitle": <exact role title from JD>,
  "companySignals": <2-3 sentences about what kind of company this is based on the JD>,
  "idealProfile": {
    "mustHaveSkills": [<10-15 non-negotiable technical skills>],
    "niceToHaveSkills": [<5-8 bonus skills that would stand out>],
    "experienceLevel": <"Fresher"|"0-1 years"|"1-3 years"|"3-5 years"|"5+ years">,
    "educationExpected": <what degree/background they expect>,
    "keyPhrases": [<8-10 exact phrases from JD that must appear in resume>],
    "avoidPhrases": [<3-5 cliché phrases that hurt more than help>]
  },
  "redFlags": [<3-5 things that would get a resume instantly rejected>],
  "cultureSignals": {
    "workStyle": <remote/hybrid/onsite signal>,
    "pace": <"Fast-paced startup"|"Structured MNC"|"Government/PSU">,
    "values": [<3-4 values the company signals>]
  },
  "salaryEstimate": {
    "range": <estimated CTC range for Indian market e.g. "8-15 LPA">,
    "basis": <why you estimated this>
  },
  "topTips": [<5 specific tips to tailor resume for THIS exact JD>]
}`

    const completion = await groq.chat.completions.create({
      model:       GROQ_MODEL,
      temperature: 0.2,
      max_tokens:  2000,
      messages: [
        { role: 'system', content: 'Return only valid JSON. No markdown. No extra text.' },
        { role: 'user',   content: prompt },
      ],
    })

    const raw     = completion.choices[0]?.message?.content ?? '{}'
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()
    const first   = cleaned.indexOf('{')
    const last    = cleaned.lastIndexOf('}')
    const parsed  = JSON.parse(cleaned.slice(first, last + 1))

    // Save to DB
    await prisma.ghostSession.create({
      data: {
        userId:        session.user.id,
        jobDescription,
        ghostProfile:  parsed,
      },
    })

    return NextResponse.json({ success: true, data: parsed })

  } catch (err) {
    console.error('[GHOST MODE ERROR]', err)
    return NextResponse.json({ success: false, error: 'Analysis failed' }, { status: 500 })
  }
}