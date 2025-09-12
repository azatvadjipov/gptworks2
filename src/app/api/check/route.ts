import { NextRequest, NextResponse } from 'next/server'
import { validateInitData, getChatMember } from '@/lib/telegram'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { initData } = await request.json()

    if (!initData || typeof initData !== 'string') {
      return NextResponse.json(
        { error: 'Invalid initData' },
        { status: 400 }
      )
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Validate initData
    const validatedData = validateInitData(initData, botToken)
    if (!validatedData || !validatedData.user) {
      return NextResponse.json(
        { error: 'Invalid Telegram initData' },
        { status: 400 }
      )
    }

    const userId = validatedData.user.id
    const channelId = process.env.TELEGRAM_CHANNEL_ID

    if (!channelId) {
      console.error('TELEGRAM_CHANNEL_ID not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Check membership
    const isMember = await getChatMember(botToken, channelId, userId)

    return NextResponse.json({ member: isMember })
  } catch (error) {
    console.error('Error in /api/check:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
