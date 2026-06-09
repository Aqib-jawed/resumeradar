import { prisma } from '@/lib/prisma'
import { groq, GROQ_MODEL } from '@/lib/groq'
import { supabaseAdmin } from '@/lib/supabase'

export async function processScan(scanId: string) {
  try {
    await prisma.scan.update({
      where: { id: scanId },
      data:  { status: 'PROCESSING' },
    })

    const scan = await prisma.scan.findUnique({ where: { id: scanId } })
    if (!scan) throw new Error('Scan not found')

    console.log(`[SCAN START] ${scanId} — ${scan.jobTitle} @ ${scan.companyName}`)

    // Download PDF from Supabase Storage
    const { data: fileData, error: dlError } = await supabaseAdmin.storage
      .from('resumes')
      .download(scan.resumeS3Key!)

    if (dlError || !fileData) throw new Error(`Download failed: ${dlError?.message}`)

    const buffer = Buffer.from(await fileData.arrayBuffer())
    console.log(`[SCAN] PDF buffer: ${buffer.length} bytes`)

    // Extract text
    const resumeText = await extractPdfText(buffer)
    console.log(`[SCAN] Extracted text: ${resumeText.length} chars`)
    console.log(`[SCAN] Preview:\n${resumeText.slice(0, 400)}\n---`)

    if (resumeText.length < 50) {
      throw new Error('Could not extract text from PDF — file may be image-based or corrupted')
    }

    // AI analysis
    console.log(`[SCAN] Calling Groq AI...`)
    const result = await analyseWithGroq(
      resumeText,
      scan.jobDescription,
      scan.jobTitle,
      scan.companyName
    )
    console.log(`[SCAN] AI done — score: ${result.atsScore}`)

    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status:         'COMPLETE',
        atsScore:       result.atsScore,
        scoreBreakdown: result.scoreBreakdown,
        sectionGrades:  result.sectionGrades,
        keywords:       result.keywords,
        suggestions:    result.suggestions,
        indiaFlags:     result.indiaFlags,
        roastMode:      result.roastMode,
        resumeSections: result.resumeSections,
      },
    })

    console.log(`[SCAN COMPLETE] ${scanId}`)

  } catch (err) {
    console.error('[PROCESSOR ERROR]', err)
    await prisma.scan.update({
      where: { id: scanId },
      data:  { status: 'FAILED' },
    }).catch(() => {})
  }
}

// ── PDF extraction using pdf2json ─────────────────────────────
async function extractPdfText(buffer: Buffer): Promise<string> {
  return new Promise((resolve) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const PDFParser = require('pdf2json')
      const parser    = new PDFParser(null, 1)

      parser.on('pdfParser_dataError', (err: any) => {
        console.error('[PDF2JSON ERROR]', err)
        resolve(extractRawText(buffer))
      })

      parser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          // Extract text page by page in correct order
          const pages = pdfData?.Pages ?? []
          const allText: string[] = []

          for (const page of pages) {
            const texts = page?.Texts ?? []
            const pageLines: string[] = []

            for (const textItem of texts) {
              const runs = textItem?.R ?? []
              for (const run of runs) {
                const decoded = decodeURIComponent(run?.T ?? '')
                if (decoded.trim()) {
                  pageLines.push(decoded)
                }
              }
            }

            allText.push(pageLines.join(' '))
          }

          const fullText = allText
            .join('\n')
            .replace(/\s{3,}/g, '  ')
            .replace(/\n{3,}/g, '\n\n')
            .trim()

          console.log(`[PDF2JSON] Extracted: ${fullText.length} chars`)
          console.log(`[PDF2JSON] Preview:\n${fullText.slice(0, 600)}`)

          if (fullText.length > 50) {
            resolve(fullText)
          } else {
            // Fallback to getRawTextContent
            const raw  = parser.getRawTextContent() as string
            const text = raw.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
            console.log(`[PDF2JSON] Fallback raw: ${text.length} chars`)
            resolve(text.length > 50 ? text : extractRawText(buffer))
          }
        } catch (e) {
          console.error('[PDF2JSON parse error]', e)
          // Try getRawTextContent as fallback
          try {
            const raw  = parser.getRawTextContent() as string
            const text = raw.replace(/\r\n/g, '\n').trim()
            resolve(text.length > 50 ? text : extractRawText(buffer))
          } catch {
            resolve(extractRawText(buffer))
          }
        }
      })

      parser.parseBuffer(buffer)

    } catch (e) {
      console.error('[PDF2JSON init error]', e)
      resolve(extractRawText(buffer))
    }
  })
}

// ── Raw text fallback ─────────────────────────────────────────
function extractRawText(buffer: Buffer): string {
  try {
    const str    = buffer.toString('latin1')
    const chunks: string[] = []

    const tjRegex = /\(([^)\\]{2,})\)\s*Tj/g
    let match
    while ((match = tjRegex.exec(str)) !== null) {
      const text = match[1]
        .replace(/\\n/g, ' ')
        .replace(/\\r/g, '')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\')
        .trim()
      if (text.length > 1 && /[a-zA-Z]/.test(text)) {
        chunks.push(text)
      }
    }

    const tJRegex = /\[([^\]]+)\]\s*TJ/g
    while ((match = tJRegex.exec(str)) !== null) {
      const parts = match[1].match(/\(([^)]*)\)/g) ?? []
      const text  = parts.map(p => p.slice(1, -1)).join('').trim()
      if (text.length > 1 && /[a-zA-Z]/.test(text)) {
        chunks.push(text)
      }
    }

    const result = chunks.join(' ').replace(/\s+/g, ' ').trim()
    console.log(`[RAW FALLBACK] Extracted: ${result.length} chars`)
    return result
  } catch (e) {
    console.error('[RAW FALLBACK ERROR]', e)
    return ''
  }
}

// ── Groq AI analysis ─────────────────────────────────────────
async function analyseWithGroq(
  resumeText:     string,
  jobDescription: string,
  jobTitle:       string,
  companyName:    string
) {
  // Calculate basic stats to force the model to be accurate
  const jdWords     = jobDescription.toLowerCase().match(/\b\w{4,}\b/g) ?? []
  const resumeWords = resumeText.toLowerCase().match(/\b\w{4,}\b/g) ?? []
  const jdWordSet   = new Set(jdWords)
  const resumeWordSet = new Set(resumeWords)

  // Pre-calculate keyword overlap so model can't ignore it
  const overlap = [...jdWordSet].filter(w => resumeWordSet.has(w))
  const overlapPct = Math.round((overlap.length / Math.max(jdWordSet.size, 1)) * 100)

  console.log(`[SCAN] JD words: ${jdWordSet.size}, Resume words: ${resumeWordSet.size}, Overlap: ${overlapPct}%`)

  const prompt = `You are a strict ATS scoring engine. You MUST produce varied, accurate scores based on actual content.

DO NOT default to 85. DO NOT give the same score every time.
The pre-calculated keyword overlap for this resume vs JD is ${overlapPct}%.
Use this as your primary signal for keywordMatch scoring.

SCORING RULES — follow these exactly:
- keywordMatch (0-35): proportional to keyword overlap. ${overlapPct}% overlap = ${Math.round(overlapPct * 0.35)} points
- sectionCompleteness (0-25): deduct 5 points for each major missing section (summary, experience, education, skills, projects)
- formattingSignals (0-15): check for bullet points, action verbs, clean structure
- actionVerbQuality (0-10): check if bullets start with strong verbs (built, designed, led, reduced, increased)
- quantification (0-15): count bullets with numbers/metrics — each one adds ~2 points, max 15

atsScore MUST equal the exact arithmetic sum of all 5 breakdown values. No rounding tricks.

SECTION SCORING (1-10):
- 9-10: Exceptional match to JD requirements
- 7-8:  Good, minor gaps
- 5-6:  Average, noticeable gaps  
- 3-4:  Weak, significant issues
- 1-2:  Very poor or completely missing

JOB TITLE: ${jobTitle}
COMPANY: ${companyName}

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}

RESUME TEXT (read every line carefully):
${resumeText.slice(0, 6000)}

INSTRUCTIONS:
1. Read the full resume text above
2. Extract REAL content — names, companies, degrees, projects, skills — exactly as written
3. Never say contact/summary/education is missing if it exists anywhere in the text
4. Contact info is at the TOP of the resume — name, email, phone, LinkedIn
5. Summary is the introductory paragraph after contact info
6. Education has degree + university + year + CGPA

Return ONLY valid JSON, zero markdown, zero text outside the JSON object:

{
  "atsScore": <MUST equal sum of all scoreBreakdown values>,
  "scoreBreakdown": {
    "keywordMatch":        <0-35, use ${Math.round(overlapPct * 0.35)} as baseline>,
    "sectionCompleteness": <0-25>,
    "formattingSignals":   <0-15>,
    "actionVerbQuality":   <0-10>,
    "quantification":      <0-15>
  },
  "sectionGrades": {
    "education":  <1-10>,
    "skills":     <1-10>,
    "experience": <1-10>,
    "projects":   <1-10>
  },
  "resumeSections": {
    "contactInfo": {
      "content": <single string: "Name | email | phone | linkedin" — copy from top of resume>,
      "issues":  [<only genuine issues — empty array [] if contact is complete>],
      "score":   <1-10>
    },
    "summary": {
      "content": <copy the exact introductory paragraph verbatim — if ANY paragraph exists near the top, copy it here>,
      "issues":  [<only if summary is genuinely weak or missing>],
      "score":   <1-10>
    },
    "experience": {
      "jobs": [
        {
          "title":        <exact job title>,
          "company":      <exact company name>,
          "duration":     <exact dates as written>,
          "bullets":      [<copy ALL bullet points verbatim>],
          "issues":       [<specific problems vs this JD>],
          "improvements": [<rewritten versions of weak bullets>]
        }
      ],
      "overallIssues": [<cross-role issues only>],
      "score": <1-10>
    },
    "education": {
      "entries": [
        {
          "degree":      <exact degree e.g. "B.Tech, Computer Science & Engineering">,
          "institution": <exact university name>,
          "year":        <exact dates>,
          "score":       <CGPA or percentage as written>,
          "issues":      [<empty [] if degree + institution + year + CGPA all present>]
        }
      ],
      "overallIssues": [<only if real problems exist>],
      "score": <1-10, minimum 7 if degree + institution + CGPA all present>
    },
    "skills": {
      "technicalSkills": [<ALL technical skills listed>],
      "softSkills":      [<soft skills if listed>],
      "missingFromJD":   [<JD skills genuinely absent from resume>],
      "irrelevant":      [<resume skills irrelevant to this JD>],
      "issues":          [<only real issues>],
      "score":           <1-10>
    },
    "projects": {
      "entries": [
        {
          "name":         <exact project name>,
          "tech":         [<technologies used>],
          "description":  <copy exact description from resume>,
          "issues":       [<specific problems vs JD>],
          "improvements": [<improved rewrite>]
        }
      ],
      "overallIssues": [<cross-project issues>],
      "score": <1-10>
    },
    "achievements": {
      "content": [<copy EVERY achievement, hackathon, award, leadership role, competitive stat verbatim>],
      "issues":  [<only if achievements section has real problems>],
      "score":   <1-10>
    }
  },
  "keywords": {
    "matched": [<words present in BOTH resume and JD — be precise, max 15>],
    "missing": [<important JD words absent from resume — max 15>],
    "bonus":   [<strong resume words not in JD — max 6>]
  },
  "suggestions": [
    {
      "section":    <"Experience"|"Skills"|"Education"|"Projects"|"Summary"|"Contact">,
      "issue":      <specific problem in THIS resume>,
      "fix":        <specific actionable fix>,
      "impact":     <"HIGH"|"MEDIUM"|"LOW">,
      "beforeText": <actual verbatim text from the resume>,
      "afterText":  <improved rewrite>
    }
  ],
  "indiaFlags": [
    {
      "type":     <"PHOTO"|"DOB"|"MARITAL_STATUS"|"FATHERS_NAME"|"CAMPUS_EMAIL"|"HOME_ADDRESS">,
      "message":  <specific warning>,
      "severity": "WARNING"
    }
  ],
  "roastMode": {
    "summary": <2 brutally honest sentences about THIS resume vs THIS JD>,
    "bullets": [<5 specific criticisms referencing actual resume content>]
  }
}`

  let rawResponse = ''

  try {
    const completion = await groq.chat.completions.create({
      model:       GROQ_MODEL,
      temperature: 0.1,
      max_tokens:  4000,
      messages: [
        {
          role:    'system',
          content: `You are a strict ATS scoring engine. CRITICAL RULES:
1. Return ONLY valid JSON — no markdown, no text before or after
2. atsScore MUST equal the exact sum of all scoreBreakdown values
3. NEVER default to 85 — scores must reflect actual keyword overlap and content quality
4. The keyword overlap for this scan is ${overlapPct}% — use this to calibrate keywordMatch
5. Read the ENTIRE resume before judging any section
6. Never say a section is missing if it exists in the resume text`,
        },
        { role: 'user', content: prompt },
      ],
    })

    rawResponse = completion.choices[0]?.message?.content ?? ''
    console.log(`[GROQ] Raw response: ${rawResponse.length} chars`)
    console.log(`[GROQ] First 200 chars: ${rawResponse.slice(0, 200)}`)

    // Strip any markdown fences
    let cleaned = rawResponse
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    // Extract JSON boundaries
    const first = cleaned.indexOf('{')
    const last  = cleaned.lastIndexOf('}')
    if (first === -1 || last === -1) throw new Error('No JSON object found in response')
    cleaned = cleaned.slice(first, last + 1)

    const parsed = JSON.parse(cleaned)

    // ENFORCE score integrity — always recalculate
    const b   = parsed.scoreBreakdown ?? {}
    const km  = Math.min(35, Math.max(0, b.keywordMatch        ?? 0))
    const sc  = Math.min(25, Math.max(0, b.sectionCompleteness ?? 0))
    const fs  = Math.min(15, Math.max(0, b.formattingSignals   ?? 0))
    const av  = Math.min(10, Math.max(0, b.actionVerbQuality   ?? 0))
    const qu  = Math.min(15, Math.max(0, b.quantification      ?? 0))
    const sum = km + sc + fs + av + qu

    parsed.scoreBreakdown = { keywordMatch: km, sectionCompleteness: sc, formattingSignals: fs, actionVerbQuality: av, quantification: qu }
    parsed.atsScore       = sum

    // Clamp all section grades to 1-10
    const grades = parsed.sectionGrades ?? {}
    for (const key of Object.keys(grades)) {
      grades[key] = Math.min(10, Math.max(1, Math.round(Number(grades[key]) || 1)))
    }

    console.log(`[SCAN] ATS score: ${parsed.atsScore} | Keyword overlap: ${overlapPct}% | Breakdown: KM=${km} SC=${sc} FS=${fs} AV=${av} QU=${qu}`)

    return parsed

  } catch (e) {
    console.error('[GROQ ERROR]', e)
    console.error('[GROQ RAW]', rawResponse.slice(0, 500))
    throw new Error(`AI analysis failed: ${e}`)
  }
}
