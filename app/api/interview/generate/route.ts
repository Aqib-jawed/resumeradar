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

    const { scanId } = await req.json()
    if (!scanId)
      return NextResponse.json({ success: false, error: 'scanId required' }, { status: 400 })

    // Get scan data
    const scan = await prisma.scan.findFirst({
      where: { id: scanId, userId: session.user.id },
    })
    if (!scan)
      return NextResponse.json({ success: false, error: 'Scan not found' }, { status: 404 })

    // Check if already generated
    const existing = await prisma.interviewSession.findUnique({
      where:   { scanId },
      include: { questions: { orderBy: { order: 'asc' } } },
    })
    if (existing)
      return NextResponse.json({ success: true, data: existing })

    // Build context from scan
    const keywords    = scan.keywords    as any
    const suggestions = scan.suggestions as any[]
    const sections    = scan.resumeSections as any

    const missingKeywords = keywords?.missing?.join(', ')  ?? ''
    const matchedKeywords = keywords?.matched?.join(', ')  ?? ''
    const weakSections    = suggestions?.map((s: any) => `${s.section}: ${s.issue}`).join('\n') ?? ''
    const skills          = sections?.skills?.technicalSkills?.join(', ') ?? ''
    const experience      = sections?.experience?.jobs?.map((j: any) => `${j.title} at ${j.company}`).join(', ') ?? ''

    const prompt = `You are an expert technical interviewer for the Indian job market.

Generate exactly 20 interview questions based on this candidate's resume gaps vs the job description.

JOB TITLE: ${scan.jobTitle}
COMPANY: ${scan.companyName}

CANDIDATE PROFILE:
- Skills: ${skills}
- Experience: ${experience}
- Matched keywords: ${matchedKeywords}
- Missing keywords (gaps): ${missingKeywords}
- Weak sections: ${weakSections}

Generate 4 questions for each of these 5 categories:
1. Technical — core technical skills from the JD
2. Gap-Based — directly targeting the candidate's identified gaps
3. Behavioral — STAR format questions relevant to this role
4. Culture Fit — questions about working style, team fit, company values
5. Trick — gotcha questions interviewers love to use for this role

Return ONLY valid JSON:
{
  "questions": [
    {
      "category": <"Technical"|"Gap-Based"|"Behavioral"|"Culture Fit"|"Trick">,
      "difficulty": <"Easy"|"Medium"|"Hard">,
      "question": <the interview question>,
      "hint": <1-2 sentence hint on how to approach answering this>,
      "order": <1-20>
    }
  ]
}`

    const completion = await groq.chat.completions.create({
      model:       GROQ_MODEL,
      temperature: 0.4,
      max_tokens:  3000,
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
    const interviewSession = await prisma.interviewSession.create({
      data: {
        userId: session.user.id,
        scanId,
        questions: {
          create: parsed.questions.map((q: any) => ({
            category:   q.category,
            difficulty: q.difficulty,
            question:   q.question,
            hint:       q.hint,
            order:      q.order,
          })),
        },
      },
      include: { questions: { orderBy: { order: 'asc' } } },
    })

    return NextResponse.json({ success: true, data: interviewSession })

  } catch (err) {
    console.error('[INTERVIEW GENERATE ERROR]', err)
    return NextResponse.json({ success: false, error: 'Failed to generate questions' }, { status: 500 })
  }
}