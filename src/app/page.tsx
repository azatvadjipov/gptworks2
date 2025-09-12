'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string
      }
    }
  }
}

export default function Home() {
  const [status, setStatus] = useState<'loading' | 'error' | 'dev'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

  useEffect(() => {
    const checkMembership = async () => {
      try {
        // Get initData from Telegram WebApp
        const initData = window.Telegram?.WebApp?.initData

        if (!initData) {
          if (isDevMode) {
            // In development mode, show test options instead of error
            setStatus('dev')
            return
          }
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
        setStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'Неизвестная ошибка')
      }
    }

    checkMembership()
  }, [router])

  if (status === 'dev') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-blue-600 text-lg font-semibold mb-4">
            Режим разработки
          </div>
          <div className="text-gray-600 mb-6">
            Выберите сценарий для тестирования:
          </div>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/go?member=true')}
              className="w-full bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700 transition-colors"
            >
              🟢 Тестировать как участник канала
            </button>
            <button
              onClick={() => router.push('/go?member=false')}
              className="w-full bg-red-600 text-white px-4 py-3 rounded hover:bg-red-700 transition-colors"
            >
              🔴 Тестировать как не участник канала
            </button>
          </div>
          <div className="mt-6 text-sm text-gray-500">
            Для включения режима разработки установите NEXT_PUBLIC_DEV_MODE=true в .env.local
          </div>
        </div>
      </div>
    )
  }

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
          Проверяем доступ…
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  )
}
