'use server'

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const year = searchParams.get('year')
  
  if (!year) {
    return NextResponse.json(
      { error: 'Year parameter is required' },
      { status: 400 }
    )
  }

  const apiKey = process.env.NEXT_PUBLIC_HOLIDAY_API_KEY
  
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(
      `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo?solYear=${year}&_type=json&numOfRows=100&serviceKey=${encodeURIComponent(apiKey)}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800', // 1일 캐시, 1주일 stale
      },
    })
  } catch (error) {
    console.error('Holiday API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch holidays' },
      { status: 500 }
    )
  }
}

