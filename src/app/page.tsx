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
        // Wait for Telegram WebApp to be ready
        const waitForTelegram = () => {
          return new Promise<void>((resolve, reject) => {
            const maxWait = 5000 // 5 seconds max wait
            const checkInterval = 100 // check every 100ms
            let elapsed = 0

            const check = () => {
              elapsed += checkInterval

              // Check if Telegram WebApp is available and has initData
              if (window.Telegram?.WebApp?.initData) {
                // Call ready() to signal that the app is ready
                if (window.Telegram.WebApp.ready) {
                  window.Telegram.WebApp.ready()
                }
                resolve()
                return
              }

              // Timeout after maxWait
              if (elapsed >= maxWait) {
                reject(new Error('Telegram WebApp initialization timeout'))
                return
              }

              // Continue checking
              setTimeout(check, checkInterval)
            }

            // Start checking immediately
            check()
          })
        }

        // Wait for Telegram WebApp to be ready
        await waitForTelegram()

        // Get initData from Telegram WebApp
        const initData = window.Telegram?.WebApp?.initData

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
          if (error.message.includes('timeout')) {
            errorMessage = 'Ошибка: Telegram не отвечает. Попробуйте перезагрузить приложение.'
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
