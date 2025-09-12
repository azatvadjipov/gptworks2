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
        // Wait for Telegram WebApp to be fully ready (optimized for speed)
        const waitForWebApp = () => {
          return new Promise<void>((resolve, reject) => {
            const maxAttempts = 30 // 3 seconds max (30 * 100ms)
            let attempts = 0

            const check = () => {
              attempts++
              const progressPercent = Math.min((attempts / maxAttempts) * 100, 100)
              setProgress(progressPercent)

              // Quick check: if Telegram WebApp is available and has data
              if (window.Telegram?.WebApp?.initData) {
                console.log('Telegram WebApp ready with initData')
                setProgress(100)
                resolve()
                return
              }

              // Early trigger: try to initialize WebApp after 0.3 seconds
              if (window.Telegram?.WebApp && attempts === 3) {
                console.log('Attempting to trigger WebApp ready...')
                try {
                  if (window.Telegram.WebApp.ready) {
                    window.Telegram.WebApp.ready()
                  }
                } catch (e) {
                  console.log('WebApp.ready() call failed:', e)
                }
              }

              // Check if WebApp exists but no initData yet (might be loading)
              if (window.Telegram?.WebApp && attempts > 5) {
                console.log('Telegram WebApp detected, waiting for initData... (' + attempts + '/' + maxAttempts + ')')
              }

              if (attempts >= maxAttempts) {
                console.log('Telegram WebApp initData timeout after', attempts, 'attempts')

                // More comprehensive Telegram environment detection
                const isTelegramEnv =
                  // Check user agent
                  /telegram/i.test(navigator.userAgent) ||
                  // Check referrer
                  /telegram/i.test(document.referrer) ||
                  /t\.me/i.test(document.referrer) ||
                  // Check hostname
                  window.location.hostname.includes('t.me') ||
                  window.location.hostname.includes('telegram') ||
                  // Check URL parameters
                  window.location.search.includes('tgWebAppData') ||
                  window.location.search.includes('tgWebAppVersion') ||
                  // Check if likely in WebView (no opener, limited history)
                  (!window.opener && window.history.length <= 1) ||
                  // Check if screen dimensions suggest mobile WebView
                  (window.innerWidth < 500 && window.innerHeight < 900)

                // Special case: if we're on Vercel, came from Telegram, but WebApp is NOT available, allow demo mode
                const isVercelFromTelegram = window.location.hostname.includes('vercel.app') &&
                  (/telegram/i.test(document.referrer) || /t\.me/i.test(document.referrer)) &&
                  !window.Telegram?.WebApp // Only activate demo when WebApp is NOT available

                console.log('Telegram environment detection:', isTelegramEnv)
                console.log('Vercel from Telegram:', isVercelFromTelegram)
                console.log('UserAgent:', navigator.userAgent)
                console.log('Referrer:', document.referrer)
                console.log('Hostname:', window.location.hostname)
                console.log('Search params:', window.location.search)
                console.log('Telegram object exists:', !!window.Telegram)
                console.log('WebApp object exists:', !!window.Telegram?.WebApp)

                if (isTelegramEnv && !isVercelFromTelegram) {
                  reject(new Error('Telegram WebApp не загружается. Убедитесь, что Mini App правильно настроен в BotFather.'))
                } else if (isVercelFromTelegram) {
                  // Allow demo mode for Vercel + Telegram referrer
                  console.log('Demo mode activated - proceeding without WebApp data')
                  // Simulate successful WebApp initialization for demo
                  if (!window.Telegram) window.Telegram = {}
                  if (!window.Telegram.WebApp) {
                    window.Telegram.WebApp = {
                      initData: 'user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%20User%22%2C%22username%22%3A%22testuser%22%7D&chat_instance=123456&hash=abc123def456',
                      initDataUnsafe: {
                        user: { id: 123456789, first_name: 'Test User', username: 'testuser' },
                        chat_instance: '123456',
                        hash: 'abc123def456'
                      },
                      version: '6.0',
                      platform: 'demo',
                      ready: () => console.log('Demo WebApp ready')
                    }
                  }
                  resolve()
                  return
                } else {
                  reject(new Error('Это приложение работает только в Telegram Mini Apps. Откройте его через Telegram бота.'))
                }
                return
              }

              setTimeout(check, 100)
            }

            // Start checking after a short delay to let the page settle
            setTimeout(check, 300)
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
          if (error.message.includes('Mini App правильно настроен')) {
            errorMessage = error.message // Уже содержит правильное сообщение
          } else if (error.message.includes('работает только в Telegram Mini Apps')) {
            errorMessage = error.message // Уже содержит правильное сообщение
          } else if (error.message.includes('закрыть и открыть')) {
            errorMessage = error.message // Уже содержит правильное сообщение
          } else if (error.message.includes('только в Telegram')) {
            errorMessage = error.message // Уже содержит правильное сообщение
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
