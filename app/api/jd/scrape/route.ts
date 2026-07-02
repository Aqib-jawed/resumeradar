import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import * as cheerio from 'cheerio'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { url } = await req.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 })
    }

    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      })

      if (!response.ok) {
        if (response.status === 999 && hostname.includes('linkedin')) {
          throw new Error('LinkedIn blocked the request.')
        }
        throw new Error(`Failed to fetch page: ${response.status}`)
      }

      const html = await response.text()
      const $ = cheerio.load(html)

      let jobTitle = ''
      let companyName = ''
      let jobDescription = ''

      if (hostname.includes('naukri.com')) {
        jobTitle = $('.jd-header-title').text().trim() || $('h1').first().text().trim()
        companyName = $('.jd-header-comp-name').text().trim() || $('.jd-header-company-name').text().trim()
        jobDescription = $('.jd-desc').text().trim() || $('.job-description').text().trim()
      } else if (hostname.includes('linkedin.com')) {
        jobTitle = $('.top-card-layout__title').text().trim() || $('h1').first().text().trim()
        companyName = $('.topcard__org-name-link').text().trim() || $('.topcard__flavor').first().text().trim()
        jobDescription = $('.description__text').text().trim() || $('.show-more-less-html__markup').text().trim()
      } else if (hostname.includes('internshala.com')) {
        jobTitle = $('.heading_4_5').first().text().trim()
        companyName = $('.heading_6').first().text().trim()
        jobDescription = $('.text-container').text().trim()
      } else if (hostname.includes('unstop.com')) {
        jobTitle = $('h1').first().text().trim()
        companyName = $('.company-name').text().trim() || $('h2').first().text().trim()
        jobDescription = $('.job-description').text().trim() || $('.description').text().trim()
      } else {
        jobTitle = $('h1').first().text().trim()
        jobDescription = $('meta[name="description"]').attr('content') || $('body').text().substring(0, 1000).trim()
      }

      if (!jobDescription || jobDescription.length < 50) {
        throw new Error('Could not extract sufficient job description content.')
      }

      return NextResponse.json({
        success: true,
        data: {
          jobTitle: jobTitle || 'Unknown Title',
          companyName: companyName || 'Unknown Company',
          jobDescription,
        },
      })
    } catch (fetchErr: any) {
      console.warn(`[JD SCRAPE WARNING] ${fetchErr.message}`)
      return NextResponse.json(
        { 
          error: 'SCRAPE_FAILED', 
          message: 'Could not auto-import this URL. Please paste the job description manually.' 
        },
        { status: 422 }
      )
    }
  } catch (err) {
    console.error('[JD SCRAPE ERROR]', err)
    return NextResponse.json(
      { 
        error: 'SCRAPE_FAILED', 
        message: 'Could not auto-import this URL. Please paste the job description manually.' 
      },
      { status: 422 }
    )
  }
}
