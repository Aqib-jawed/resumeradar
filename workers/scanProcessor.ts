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
  const prompt = `You are a strict, senior ATS analyst for the Indian job market. Your analysis must be based EXCLUSIVELY on the resume text provided. Never assume content is missing if it exists anywhere in the text.

CRITICAL RULES:
1. Read the ENTIRE resume text before making ANY judgement
2. Contact info (name, email, phone, LinkedIn) is almost always at the TOP of a resume — look for it there first
3. A summary/objective paragraph near the top (after contact info) counts as a summary — do NOT say "not found" if any introductory paragraph exists
4. Education section contains degree, university, graduation year, CGPA — look for "B.Tech", "B.E.", "MBA", "University", "CGPA", "GPA", "College"
5. Score each section honestly based on quality vs the JD — do NOT give everything 85
6. ATS score MUST vary based on actual keyword match — if only 30% of JD keywords are in the resume, score should reflect that

SCORING SCALE (use 1-10 for sections, 0-100 for ATS):
- 9-10: Exceptional, perfectly tailored to this JD
- 7-8: Strong, minor gaps
- 5-6: Average, noticeable gaps
- 3-4: Weak, major gaps
- 1-2: Very poor or missing

JOB TITLE: ${jobTitle}
COMPANY: ${companyName}

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}

RESUME TEXT (read every single line):
${resumeText.slice(0, 6000)}

Return ONLY valid JSON. No markdown. No text before or after:
{
  "atsScore": <integer 0-100 calculated as: keywordMatch + sectionCompleteness + formattingSignals + actionVerbQuality + quantification>,
  "scoreBreakdown": {
    "keywordMatch":        <0-35, based on % of JD keywords found in resume>,
    "sectionCompleteness": <0-25, deduct heavily if key sections missing>,
    "formattingSignals":   <0-15>,
    "actionVerbQuality":   <0-10>,
    "quantification":      <0-15, how many bullets have numbers/metrics>
  },
  "sectionGrades": {
    "education":  <1-10>,
    "skills":     <1-10>,
    "experience": <1-10>,
    "projects":   <1-10>
  },
  "resumeSections": {
    "contactInfo": {
      "content": <copy the EXACT contact line from the resume as a single string e.g. "Aqib Jawed | +91-9110131657 | ajawed.work@gmail.com | linkedin.com/in/aqib">,
      "issues": [<ONLY add issues if something is genuinely missing — e.g. "No LinkedIn URL" only if LinkedIn is actually absent>],
      "score": <1-10>
    },
    "summary": {
      "content": <copy the EXACT summary/objective paragraph from the resume. If ANY introductory paragraph exists after the contact info, it IS the summary — copy it verbatim>,
      "issues": [<only real issues — if a good summary exists tailored to the role, issues array should be empty []>],
      "score": <1-10>
    },
    "experience": {
      "jobs": [
        {
          "title":        <exact job title from resume>,
          "company":      <exact company name>,
          "duration":     <exact dates as written>,
          "bullets":      [<copy ALL actual bullet points from this role verbatim>],
          "issues":       [<specific problems with these bullets vs the JD>],
          "improvements": [<specific rewritten versions of weak bullets>]
        }
      ],
      "overallIssues": [<only genuine cross-role issues>],
      "score": <1-10>
    },
    "education": {
      "entries": [
        {
          "degree":      <exact degree text e.g. "B.Tech, Computer Science & Engineering">,
          "institution": <exact university name>,
          "year":        <exact dates e.g. "Aug 2023 – May 2027">,
          "score":       <exact CGPA/percentage as written e.g. "CGPA: 8.53 / 10">,
          "issues":      [<only genuine issues — if degree + institution + year + CGPA all exist, issues should be []>]
        }
      ],
      "overallIssues": [<only flag if education section has real problems>],
      "score": <1-10, give 8+ if degree + institution + CGPA all present>
    },
    "skills": {
      "technicalSkills": [<ALL technical skills listed in the resume>],
      "softSkills":      [<soft skills if any>],
      "missingFromJD":   [<important JD skills genuinely absent from resume>],
      "irrelevant":      [<skills listed that are irrelevant to THIS specific JD>],
      "issues":          [<only real issues>],
      "score": <1-10>
    },
    "projects": {
      "entries": [
        {
          "name":         <exact project name>,
          "tech":         [<technologies used>],
          "description":  <copy the actual project description from resume>,
          "issues":       [<specific issues with THIS project vs the JD>],
          "improvements": [<specific improved version of the project description>]
        }
      ],
      "overallIssues": [<cross-project issues>],
      "score": <1-10>
    },
    "achievements": {
      "content": [<copy ALL achievements, hackathons, leadership roles, competitive programming stats EXACTLY as written>],
      "issues":  [<only if achievements section has real problems>],
      "score":   <1-10>
    }
  },
  "keywords": {
    "matched": [<keywords genuinely in BOTH resume and JD — be precise>],
    "missing": [<important JD keywords genuinely absent from resume>],
    "bonus":   [<strong resume keywords not required by JD>]
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
      "type":     <"PHOTO"|"DOB"|"MARITAL_STATUS"|"FATHERS_NAME"|"CAMPUS_EMAIL"|"HOME_ADDRESS"|"RELIGION">,
      "message":  <specific warning>,
      "severity": "WARNING"
    }
  ],
  "roastMode": {
    "summary": <2 brutally honest sentences about the biggest weaknesses of THIS specific resume vs THIS specific JD>,
    "bullets": [<5 specific, actionable criticisms — reference actual resume content>]
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
          content: 'You are a strict ATS analyst. Return only valid JSON. Never say a section is missing if it exists in the resume text. Read the full text before judging.',
        },
        { role: 'user', content: prompt },
      ],
    })

    rawResponse = completion.choices[0]?.message?.content ?? ''
    console.log(`[GROQ] Response: ${rawResponse.length} chars`)
    console.log(`[GROQ] First 400:\n${rawResponse.slice(0, 400)}`)

    let cleaned = rawResponse
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    const first = cleaned.indexOf('{')
    const last  = cleaned.lastIndexOf('}')
    if (first !== -1 && last !== -1) cleaned = cleaned.slice(first, last + 1)

    const parsed = JSON.parse(cleaned)

    // Fix score integrity
    const b   = parsed.scoreBreakdown ?? {}
    const sum =
      (b.keywordMatch        ?? 0) +
      (b.sectionCompleteness ?? 0) +
      (b.formattingSignals   ?? 0) +
      (b.actionVerbQuality   ?? 0) +
      (b.quantification      ?? 0)
    parsed.atsScore = Math.min(100, Math.max(0, sum))

    console.log(`[SCAN] Final ATS score: ${parsed.atsScore}`)
    return parsed

  } catch (e) {
    console.error('[GROQ ERROR]', e)
    console.error('[GROQ RAW]', rawResponse.slice(0, 800))
    throw new Error(`AI analysis failed: ${e}`)
  }
}