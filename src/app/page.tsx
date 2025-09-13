'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

interface TelegramWebApp {
  initData: string
  initDataUnsafe?: {
    user?: TelegramUser
    chat_instance?: string
    hash: string
  }
  version?: string
  platform?: string
  ready: () => void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp
    }
  }
}

export default function Home() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const checkMembership = async () => {
      try {
        // Wait for Telegram WebApp
        const waitForWebApp = () => {
          return new Promise<void>((resolve, reject) => {
            const maxAttempts = 30
            let attempts = 0

            const check = () => {
              attempts++
              setProgress(Math.min((attempts / maxAttempts) * 100, 100))

              if (window.Telegram?.WebApp?.initData) {
                setProgress(100)
                resolve()
                return
              }

              if (attempts >= maxAttempts) {
                reject(new Error('Telegram WebApp timeout'))
                return
              }

              setTimeout(check, 100)
            }

            setTimeout(check, 300)
          })
        }

        await waitForWebApp()

        if (window.Telegram?.WebApp?.ready) {
          window.Telegram.WebApp.ready()
        }

        // Parse user data
        const initDataStr = window.Telegram?.WebApp?.initData
        if (!initDataStr) {
          throw new Error('Init data not available')
        }

        const initData = new URLSearchParams(initDataStr)
        const userData = initData.get('user')
        if (!userData) {
          throw new Error('User data not found')
        }

        const user = JSON.parse(userData)
        const userId = user.id

        // Direct Telegram Bot API call
        const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN
        const channelId = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_ID
        const memberRedirectUrl = process.env.NEXT_PUBLIC_MEMBER_REDIRECT_URL
        const nonMemberRedirectUrl = process.env.NEXT_PUBLIC_NON_MEMBER_REDIRECT_URL

        if (!botToken || !channelId || !memberRedirectUrl || !nonMemberRedirectUrl) {
          throw new Error('Configuration missing')
        }

        const apiUrl = `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${channelId}&user_id=${userId}`

        const response = await fetch(apiUrl)
        const result = await response.json()

        if (!response.ok) {
          throw new Error('API request failed')
        }

        // Check membership status
        const status = result.result?.status
        const isMember = ['member', 'administrator', 'creator'].includes(status)

        // Direct redirect
        window.location.href = isMember ? memberRedirectUrl : nonMemberRedirectUrl

      } catch (error) {
        console.error('Error:', error)
        setStatus('error')
        setErrorMessage('Ошибка проверки доступа')
      }
    }

    checkMembership()
  }, [router])

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Ошибка
          </div>
          <div className="text-gray-600">
            {errorMessage}
          </div>
        </div>
      </div>
    )
  }

              return (
                <div className="min-h-screen flex items-center justify-center p-4">
                  <div className="text-center max-w-sm">
                    <div className="text-gray-600 text-lg mb-4">
                      Загрузка Telegram...
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>

                    <div className="text-sm text-gray-500 mb-2">
                      {progress < 30 ? 'Инициализация...' :
                       progress < 60 ? 'Подключение к Telegram...' :
                       progress < 90 ? 'Проверка доступа...' :
                       'Завершение...'}
                    </div>

                    <div className="text-xs text-gray-400">
                      {Math.round(progress)}%
                    </div>
                  </div>
                </div>
              )
}
