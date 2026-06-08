import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { groq, GROQ_MODEL } from '@/lib/groq'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id)
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { jobDescription } = await req.json()
    if (!jobDescription || jobDescription.length < 50)
      return NextResponse.json({ success: false, error: 'Please paste a full job description' }, { status: 400 })

    const prompt = `You are an expert job market analyst for India. Decode this job description.

JOB DESCRIPTION:
${jobDescription.slice(0, 4000)}

Return ONLY valid JSON:
{
  "realRequirements": [
    {
      "requirement": <actual skill or requirement>,
      "type": <"MUST_HAVE"|"PREFERRED"|"FILLER">,
      "reason": <why you classified it this way>
    }
  ],
  "hiddenSignals": [<3-5 things the JD implies but doesn't say directly>],
  "redFlags": [
    {
      "flag": <the red flag>,
      "severity": <"HIGH"|"MEDIUM"|"LOW">,
      "explanation": <what it likely means>
    }
  ],
  "salaryEstimate": {
    "range": <e.g. "8-15 LPA">,
    "level": <"Fresher"|"Junior"|"Mid"|"Senior"|"Lead">,
    "basis": <reasoning>
  },
  "cultureDecoded": {
    "actualWorkStyle": <what the work environment is really like>,
    "growthPotential": <"High"|"Medium"|"Low">,
    "techDebtLevel":   <"High"|"Medium"|"Low"|"Unknown">,
    "teamSize":        <estimate>
  },
  "applyOrNot": {
    "verdict":  <"Strong Yes"|"Yes"|"Maybe"|"No">,
    "reasons":  [<3 reasons for the verdict>]
  }
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

    return NextResponse.json({ success: true, data: parsed })

  } catch (err) {
    console.error('[JD DECODER ERROR]', err)
    return NextResponse.json({ success: false, error: 'Analysis failed' }, { status: 500 })
  }
}