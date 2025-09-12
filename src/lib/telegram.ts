import { createHmac } from 'crypto'

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

export interface InitData {
  user?: TelegramUser
  chat_instance?: string
  hash: string
}

/**
 * Validates Telegram WebApp initData using HMAC-SHA256
 * @param initData - The initData string from Telegram WebApp
 * @param botToken - Telegram bot token
 * @returns Parsed initData if valid, null if invalid
 */
export function validateInitData(initData: string, botToken: string): InitData | null {
  try {
    // Parse the initData query string
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')

    if (!hash) {
      return null
    }

    // Remove hash from params for validation
    params.delete('hash')

    // Sort parameters alphabetically
    const sortedParams = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b))

    // Create data string
    const dataString = sortedParams.map(([key, value]) => `${key}=${value}`).join('\n')

    // Create secret key (SHA256 of bot token)
    const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest()

    // Compute HMAC-SHA256
    const computedHash = createHmac('sha256', secretKey).update(dataString).digest('hex')

    if (computedHash !== hash) {
      return null
    }

    // Parse user data if present
    const userParam = params.get('user')
    let user: TelegramUser | undefined

    if (userParam) {
      try {
        user = JSON.parse(userParam)
      } catch {
        return null
      }
    }

    return {
      user,
      chat_instance: params.get('chat_instance') || undefined,
      hash
    }
  } catch {
    return null
  }
}

/**
 * Checks if a user is a member of a Telegram channel/chat
 * @param botToken - Telegram bot token
 * @param chatId - Chat/channel ID (e.g., -1001234567890)
 * @param userId - User ID to check
 * @returns true if user is member/admin/creator, false otherwise
 */
export async function getChatMember(botToken: string, chatId: string, userId: number): Promise<boolean> {
  try {
    const url = `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${chatId}&user_id=${userId}`

    const response = await fetch(url)
    const data = await response.json()

    if (!data.ok) {
      console.error('Telegram API error:', data.description)
      return false
    }

    // Check if user status indicates membership
    const memberStatuses = ['member', 'administrator', 'creator', 'restricted']
    return memberStatuses.includes(data.result.status)
  } catch (error) {
    console.error('Error checking chat member:', error)
    return false
  }
}
