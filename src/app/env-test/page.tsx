'use client'

import Link from 'next/link'

export default function EnvTestPage() {
  const getEnvInfo = () => {
    if (typeof window === 'undefined') return {}

    return {
      hostname: window.location.hostname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      search: window.location.search,
      telegramObject: !!window.Telegram,
      webAppObject: !!window.Telegram?.WebApp,
      opener: !!window.opener,
      historyLength: window.history.length,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      // Check various conditions
      hasTelegramInUA: /telegram/i.test(navigator.userAgent),
      hasTelegramInReferrer: /telegram/i.test(document.referrer),
      hasTmeInReferrer: /t\.me/i.test(document.referrer),
      hostnameHasTme: window.location.hostname.includes('t.me'),
      hostnameHasTelegram: window.location.hostname.includes('telegram'),
      searchHasTgWebAppData: window.location.search.includes('tgWebAppData'),
      searchHasTgWebAppVersion: window.location.search.includes('tgWebAppVersion'),
      searchHasTgWebApp: window.location.search.includes('tgWebApp'),
      searchHasEmbed: window.location.search.includes('embed'),
      noOpenerLimitedHistory: !window.opener && window.history.length <= 1,
      smallScreen: window.innerWidth < 500 && window.innerHeight < 900,
      // Mobile Telegram patterns
      mobileTelegramUA: /Android.*Telegram|Telegram.*Android|iPhone.*Telegram|Telegram.*iPhone/i.test(navigator.userAgent),
      // Vercel + Telegram detection
      isVercelFromTelegram: window.location.hostname.includes('vercel.app') && (
        (/telegram/i.test(document.referrer) || /t\.me/i.test(document.referrer)) ||
        /Android.*Telegram|Telegram.*Android|iPhone.*Telegram|Telegram.*iPhone/i.test(navigator.userAgent) ||
        window.location.search.includes('tgWebApp') ||
        window.location.search.includes('embed') ||
        (!window.opener && window.history.length <= 1)
      )
    }
  }

  const envInfo = getEnvInfo()

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">🔍 Environment Test</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">📊 Environment Info</h2>
          <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(envInfo, null, 2)}
          </pre>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">🎯 Telegram Detection</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Telegram in UserAgent:</span>
                <span className={envInfo.hasTelegramInUA ? 'text-green-600 font-bold' : 'text-red-600'}>{envInfo.hasTelegramInUA ? '✅' : '❌'}</span>
              </div>
              <div className="flex justify-between">
                <span>Telegram in Referrer:</span>
                <span className={envInfo.hasTelegramInReferrer ? 'text-green-600 font-bold' : 'text-red-600'}>{envInfo.hasTelegramInReferrer ? '✅' : '❌'}</span>
              </div>
              <div className="flex justify-between">
                <span>Mobile Telegram UA:</span>
                <span className={envInfo.mobileTelegramUA ? 'text-green-600 font-bold' : 'text-red-600'}>{envInfo.mobileTelegramUA ? '✅' : '❌'}</span>
              </div>
              <div className="flex justify-between">
                <span>WebView indicators:</span>
                <span className={envInfo.noOpenerLimitedHistory ? 'text-green-600 font-bold' : 'text-red-600'}>{envInfo.noOpenerLimitedHistory ? '✅' : '❌'}</span>
              </div>
              <div className="flex justify-between">
                <span>Small screen:</span>
                <span className={envInfo.smallScreen ? 'text-green-600 font-bold' : 'text-red-600'}>{envInfo.smallScreen ? '✅' : '❌'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">🚀 Demo Mode Eligibility</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Vercel + Telegram:</span>
                <span className={envInfo.isVercelFromTelegram ? 'text-green-600 font-bold text-lg' : 'text-red-600'}>{envInfo.isVercelFromTelegram ? '✅ DEMO MODE' : '❌'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors"
          >
            🏠 Test Main App
          </Link>
          <Link
            href="/debug"
            className="inline-block ml-4 bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700 transition-colors"
          >
            🔧 Debug Panel
          </Link>
        </div>
      </div>
    </div>
  )
}
