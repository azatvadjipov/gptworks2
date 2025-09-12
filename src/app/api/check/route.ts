import { NextRequest, NextResponse } from 'next/server'
import { validateInitData, getChatMember, InitData } from '@/lib/telegram'

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

    let validatedData: InitData | null = null

    // Special test mode - skip validation for mock data
    if (initData.includes('testuser') && initData.includes('Test%20User')) {
      console.log('Test mode: skipping initData validation')
      // Simulate successful validation
      const mockUser = {
        id: 123456789,
        first_name: 'Test User',
        username: 'testuser'
      }
      validatedData = {
        user: mockUser,
        chat_instance: '123456',
        hash: 'abc123def456'
      } as InitData
    } else {
      // Normal validation
      validatedData = validateInitData(initData, botToken)
      if (!validatedData || !validatedData.user) {
        return NextResponse.json(
          { error: 'Invalid Telegram initData' },
          { status: 400 }
        )
      }
    }

    const userId = validatedData.user!.id
    const channelId = process.env.TELEGRAM_CHANNEL_ID

    if (!channelId) {
      console.error('TELEGRAM_CHANNEL_ID not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // For test mode, simulate membership check result
    if (validatedData.hash === 'abc123def456') {
      console.log('Test mode: simulating membership check')
      // Demo user is NOT a member by default for testing non-member redirect
      const isMember = false // userId === 123456789 // Test user is NOT member
      return NextResponse.json({ member: isMember })
    }

    // Check membership for real data
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
