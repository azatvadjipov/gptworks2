'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function DebugPage() {
  const [envInfo, setEnvInfo] = useState<Record<string, unknown> | null>(null)

  const loadEnvInfo = () => {
    if (typeof window === 'undefined') return

    setEnvInfo({
      hostname: window.location.hostname,
      referrer: document.referrer,
      userAgent: navigator.userAgent.substring(0, 100) + '...',
      search: window.location.search,
      telegramObject: !!window.Telegram,
      webAppObject: !!window.Telegram?.WebApp,
      initData: window.Telegram?.WebApp?.initData ? 'Present' : 'Missing',
      opener: !!window.opener,
      historyLength: window.history.length,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    })
  }

  const testApiCall = async () => {
    if (!window.Telegram?.WebApp?.initData) {
      alert('No Telegram WebApp data')
      return
    }

    try {
      const initData = new URLSearchParams(window.Telegram.WebApp.initData)
      const userData = initData.get('user')
      if (!userData) throw new Error('No user data')

      const user = JSON.parse(userData)
      const userId = user.id

      const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN
      const channelId = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_ID

      if (!botToken || !channelId) {
        alert('Bot configuration missing')
        return
      }

      const apiUrl = `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${channelId}&user_id=${userId}`

      const response = await fetch(apiUrl)
      const result = await response.json()

      alert(`API Response: ${JSON.stringify(result, null, 2)}`)
    } catch (error) {
      alert(`Error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">🔍 Debug Panel</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">📊 Environment Info</h2>
          <div className="space-y-2">
            <button
              onClick={loadEnvInfo}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Load Environment Info
            </button>
            {envInfo && (
              <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(envInfo, null, 2)}
              </pre>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">🔗 API Test</h2>
          <button
            onClick={testApiCall}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Test Telegram API Call
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">📱 Navigation</h2>
          <Link
            href="/"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-4"
          >
            🏠 Main App
          </Link>
          <span className="text-sm text-gray-500">
            Use this to test the main application flow
          </span>
        </div>
      </div>
    </div>
  )
}
