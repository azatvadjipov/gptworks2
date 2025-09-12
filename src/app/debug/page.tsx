'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface TelegramData {
  initData?: string
  initDataUnsafe?: unknown
  version?: string
  platform?: string
}

export default function DebugPage() {
  const router = useRouter()
  const [domain, setDomain] = useState('Loading...')
  const [userAgent, setUserAgent] = useState('Loading...')
  const [telegramStatus, setTelegramStatus] = useState('Checking...')
  const [devMode, setDevMode] = useState('Checking...')
  const [apiResult, setApiResult] = useState('Click to test API')
  const [telegramData, setTelegramData] = useState('Click to load data')
  const [logs, setLogs] = useState<string[]>(['Debug page initialized'])

  const log = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  useEffect(() => {
    // Initialize debug info
    setDomain(window.location.hostname)
    setUserAgent(navigator.userAgent.substring(0, 50) + '...')

    const isDevMode = window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.includes('vercel.app')
    setDevMode(isDevMode ? 'Enabled' : 'Disabled')

    // Check Telegram WebApp status more thoroughly
    if (typeof window !== 'undefined') {
      if (window.Telegram?.WebApp) {
        if (window.Telegram.WebApp.initData) {
          setTelegramStatus('Ready with data')
        } else {
          setTelegramStatus('Detected (no initData)')
        }
      } else if (window.Telegram) {
        setTelegramStatus('Partial (no WebApp)')
      } else {
        setTelegramStatus('Not detected')
      }
    } else {
      setTelegramStatus('SSR - not available')
    }

    log('Debug page initialized')
  }, [])

  const testMemberRedirect = () => {
    log('Testing member redirect...')
    router.push('/go?member=true')
  }

  const testNonMemberRedirect = () => {
    log('Testing non-member redirect...')
    router.push('/go?member=false')
  }

  const testMainPage = () => {
    log('Navigating to main page...')
    router.push('/')
  }

  const testApiConnection = async () => {
    log('Testing API connection...')
    try {
      const response = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: 'test' })
      })
      const result = await response.json()
      setApiResult(JSON.stringify(result, null, 2))
      log('API test completed: ' + response.status)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setApiResult('Error: ' + errorMessage)
      log('API test failed: ' + errorMessage)
    }
  }

  const showTelegramData = () => {
    log('Loading Telegram data...')
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const data: TelegramData = {
        initData: window.Telegram.WebApp.initData,
        initDataUnsafe: window.Telegram.WebApp.initDataUnsafe,
        version: window.Telegram.WebApp.version,
        platform: window.Telegram.WebApp.platform
      }
      setTelegramData(JSON.stringify(data, null, 2))
      log('Telegram data loaded')
    } else {
      setTelegramData('Telegram WebApp not detected')
      log('Telegram WebApp not available')
    }
  }

  const clearLogs = () => {
    setLogs(['Logs cleared...'])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔧 Telegram Mini App - Debug Panel
        </h1>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Environment Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📋 Environment Info
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Domain:</strong>{' '}
                <span className="text-blue-600">{domain}</span>
              </div>
              <div>
                <strong>User Agent:</strong>{' '}
                <span className="text-gray-600">{userAgent}</span>
              </div>
              <div>
                <strong>Telegram WebApp:</strong>{' '}
                <span className={telegramStatus === 'Detected' ? 'text-green-600' : 'text-red-600'}>
                  {telegramStatus}
                </span>
              </div>
              <div>
                <strong>Development Mode:</strong>{' '}
                <span className={devMode === 'Enabled' ? 'text-green-600' : 'text-red-600'}>
                  {devMode}
                </span>
              </div>
            </div>
          </div>

          {/* Test Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🧪 Test Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={testMemberRedirect}
                className="w-full bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700 transition-colors"
              >
                🟢 Test Member Redirect
              </button>
              <button
                onClick={testNonMemberRedirect}
                className="w-full bg-red-600 text-white px-4 py-3 rounded hover:bg-red-700 transition-colors"
              >
                🔴 Test Non-Member Redirect
              </button>
              <button
                onClick={testMainPage}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 transition-colors"
              >
                🏠 Test Main Page
              </button>
            </div>
          </div>

          {/* API Testing */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🔗 API Testing
            </h2>
            <div className="space-y-3">
              <button
                onClick={testApiConnection}
                className="w-full bg-purple-600 text-white px-4 py-3 rounded hover:bg-purple-700 transition-colors"
              >
                Test API Connection
              </button>
              <pre className="text-sm text-gray-600 mt-2 bg-gray-100 p-2 rounded max-h-32 overflow-auto">
                {apiResult}
              </pre>
            </div>
          </div>

          {/* Telegram Data */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📱 Telegram Data
            </h2>
            <div className="space-y-2">
              <button
                onClick={showTelegramData}
                className="w-full bg-indigo-600 text-white px-4 py-3 rounded hover:bg-indigo-700 transition-colors"
              >
                Show Telegram Data
              </button>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto max-h-32">
                {telegramData}
              </pre>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📝 Debug Logs
          </h2>
          <div className="text-sm text-gray-600 bg-gray-100 p-4 rounded max-h-48 overflow-auto font-mono">
            {logs.map((logEntry, index) => (
              <div key={index}>{logEntry}</div>
            ))}
          </div>
          <button
            onClick={clearLogs}
            className="mt-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Clear Logs
          </button>
        </div>
      </div>
    </div>
  )
}
