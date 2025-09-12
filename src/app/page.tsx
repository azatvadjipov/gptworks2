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

  useEffect(() => {
    const checkMembership = async () => {
      try {
        // Wait for Telegram WebApp to be fully ready
        const waitForWebApp = () => {
          return new Promise<void>((resolve, reject) => {
            const maxAttempts = 30 // 3 seconds max (30 * 100ms) - reduced timeout
            let attempts = 0

            const check = () => {
              attempts++

              // Check if Telegram WebApp is available and has data
              if (window.Telegram?.WebApp?.initData) {
                console.log('Telegram WebApp ready with initData')
                resolve()
                return
              }

              // Check if WebApp exists but no initData yet (might be loading)
              if (window.Telegram?.WebApp && attempts > 5) {
                console.log('Telegram WebApp detected, waiting for initData...')
              }

              if (attempts >= maxAttempts) {
                console.log('Telegram WebApp initData timeout')

                // Check if we're in Telegram environment but WebApp failed
                const isTelegramEnv = /telegram/i.test(navigator.userAgent) ||
                                    /telegram/i.test(document.referrer) ||
                                    window.location.hostname.includes('t.me') ||
                                    window.location.search.includes('tgWebAppData')

                if (isTelegramEnv) {
                  reject(new Error('Telegram WebApp failed to initialize. Please restart the app.'))
                } else {
                  reject(new Error('This app only works in Telegram. Please open it through Telegram.'))
                }
                return
              }

              setTimeout(check, 100)
            }

            // Start checking immediately, but give it a moment first
            setTimeout(check, 200)
          })
        }

        // Wait for WebApp to be ready
        await waitForWebApp()

        // Get initData from Telegram WebApp
        const initData = window.Telegram?.WebApp?.initData

        // Call ready() to signal the app is ready
        if (window.Telegram?.WebApp?.ready) {
          window.Telegram.WebApp.ready()
        }

        if (!initData) {
          setStatus('error')
          setErrorMessage('Ошибка: данные Telegram недоступны')
          return
        }

        // Call API to check membership
        const response = await fetch('/api/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ initData }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Ошибка проверки доступа')
        }

        const data = await response.json()

        // Navigate to redirect handler
        router.push(`/go?member=${data.member}`)
      } catch (error) {
        console.error('Error:', error)

        let errorMessage = 'Неизвестная ошибка'
        if (error instanceof Error) {
          if (error.message.includes('restart the app')) {
            errorMessage = 'Ошибка: Telegram Mini App не загружается. Попробуйте перезапустить приложение.'
          } else if (error.message.includes('only works in Telegram')) {
            errorMessage = 'Это приложение работает только в Telegram. Откройте его через Telegram.'
          } else if (error.message.includes('timeout') || error.message.includes('not available')) {
            errorMessage = 'Ошибка: Не удается получить данные Telegram. Попробуйте перезагрузить страницу.'
          } else {
            errorMessage = error.message
          }
        }

        setStatus('error')
        setErrorMessage(errorMessage)
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
      <div className="text-center">
        <div className="text-gray-600 text-lg mb-2">
          Загрузка
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  )
}
