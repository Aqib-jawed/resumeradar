import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title:       'ResumeRadar — ATS Intelligence for Indian Job Seekers',
  description: 'Know exactly why your resume is being rejected. AI-powered ATS analysis built for Naukri, LinkedIn, Internshala & Unstop.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}