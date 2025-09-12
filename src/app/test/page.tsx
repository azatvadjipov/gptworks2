'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TestPage() {
  const router = useRouter()

  useEffect(() => {
    // Simulate Telegram WebApp initialization
    const initTelegramWebApp = () => {
      if (typeof window !== 'undefined') {
        // Create mock Telegram WebApp
        if (window.Telegram) {
          window.Telegram.WebApp = {
            initData: 'user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%20User%22%2C%22username%22%3A%22testuser%22%7D&chat_instance=123456&hash=abc123def456',
            initDataUnsafe: {
              user: {
                id: 123456789,
                first_name: 'Test User',
                username: 'testuser'
              },
              chat_instance: '123456',
              hash: 'abc123def456'
            },
            version: '6.0',
            platform: 'test',
            ready: () => {
              console.log('Telegram WebApp ready (simulated)')
            }
          }
        } else {
          window.Telegram = {
            WebApp: {
              initData: 'user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%20User%22%2C%22username%22%3A%22testuser%22%7D&chat_instance=123456&hash=abc123def456',
              initDataUnsafe: {
                user: {
                  id: 123456789,
                  first_name: 'Test User',
                  username: 'testuser'
                },
                chat_instance: '123456',
                hash: 'abc123def456'
              },
              version: '6.0',
              platform: 'test',
              ready: () => {
                console.log('Telegram WebApp ready (simulated)')
              }
            }
          }
        }

        // Simulate delay like in real Telegram WebApp
        setTimeout(() => {
          console.log('Telegram WebApp initialized (simulated)')
          // Redirect to main page after simulation
          router.push('/')
        }, 1000)
      }
    }

    initTelegramWebApp()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-blue-50">
      <div className="text-center max-w-md">
        <div className="text-2xl font-bold text-blue-600 mb-4">
          🧪 Тестирование Telegram WebApp
        </div>
        <div className="text-gray-600 mb-6">
          Имитируем загрузку Telegram Mini App...
        </div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
        <div className="mt-4 text-sm text-gray-500">
          Через 1 секунду будет перенаправлено на главную страницу
        </div>
      </div>
    </div>
  )
}
