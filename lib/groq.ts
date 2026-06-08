import Groq from 'groq-sdk'

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

// llama-3.3-70b-versatile is best for structured JSON output
export const GROQ_MODEL = 'llama-3.3-70b-versatile'