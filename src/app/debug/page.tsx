import { redirect } from 'next/navigation'

interface DebugPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DebugPage({ searchParams }: DebugPageProps) {
  const params = await searchParams
  const action = params.action

  // Handle different debug actions
  if (action === 'test-member') {
    redirect('/go?member=true')
  }

  if (action === 'test-nonmember') {
    redirect('/go?member=false')
  }

  if (action === 'test-api') {
    // This will be handled by client-side JavaScript
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
                <span id="domain" className="text-blue-600">Loading...</span>
              </div>
              <div>
                <strong>User Agent:</strong>{' '}
                <span id="useragent" className="text-gray-600">Loading...</span>
              </div>
              <div>
                <strong>Telegram WebApp:</strong>{' '}
                <span id="telegram-status" className="text-red-600">Not detected</span>
              </div>
              <div>
                <strong>Development Mode:</strong>{' '}
                <span id="dev-mode" className="text-yellow-600">Checking...</span>
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
                onClick={() => window.location.href = '/debug?action=test-member'}
                className="w-full bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700 transition-colors"
              >
                🟢 Test Member Redirect
              </button>
              <button
                onClick={() => window.location.href = '/debug?action=test-nonmember'}
                className="w-full bg-red-600 text-white px-4 py-3 rounded hover:bg-red-700 transition-colors"
              >
                🔴 Test Non-Member Redirect
              </button>
              <button
                onClick={() => window.location.href = '/'}
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
              <div id="api-result" className="text-sm text-gray-600 mt-2">
                Click to test API
              </div>
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
              <pre id="telegram-data" className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto max-h-32">
                Click to load data
              </pre>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📝 Debug Logs
          </h2>
          <div id="debug-logs" className="text-sm text-gray-600 bg-gray-100 p-4 rounded max-h-48 overflow-auto font-mono">
            Logs will appear here...
          </div>
          <button
            onClick={() => document.getElementById('debug-logs')!.innerHTML = 'Logs cleared...'}
            className="mt-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Clear Logs
          </button>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Initialize debug info
            document.getElementById('domain').textContent = window.location.hostname;
            document.getElementById('useragent').textContent = navigator.userAgent.substring(0, 50) + '...';

            const isDevMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ||
                            window.location.hostname.includes('vercel.app');
            document.getElementById('dev-mode').textContent = isDevMode ? 'Enabled' : 'Disabled';
            document.getElementById('dev-mode').className = isDevMode ? 'text-green-600' : 'text-red-600';

            // Check Telegram WebApp
            if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
              document.getElementById('telegram-status').textContent = 'Detected';
              document.getElementById('telegram-status').className = 'text-green-600';
            }

            function log(message) {
              const logs = document.getElementById('debug-logs');
              const timestamp = new Date().toLocaleTimeString();
              logs.innerHTML += '\\n[' + timestamp + '] ' + message;
              logs.scrollTop = logs.scrollHeight;
            }

            // Make functions global
            window.testApiConnection = async function() {
              log('Testing API connection...');
              try {
                const response = await fetch('/api/check', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ initData: 'test' })
                });
                const result = await response.json();
                document.getElementById('api-result').innerHTML = '<pre>' + JSON.stringify(result, null, 2) + '</pre>';
                log('API test completed: ' + response.status);
              } catch (error) {
                document.getElementById('api-result').innerHTML = '<span class="text-red-600">Error: ' + error.message + '</span>';
                log('API test failed: ' + error.message);
              }
            };

            window.showTelegramData = function() {
              log('Loading Telegram data...');
              if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
                const data = {
                  initData: window.Telegram.WebApp.initData,
                  initDataUnsafe: window.Telegram.WebApp.initDataUnsafe,
                  version: window.Telegram.WebApp.version,
                  platform: window.Telegram.WebApp.platform
                };
                document.getElementById('telegram-data').textContent = JSON.stringify(data, null, 2);
                log('Telegram data loaded');
              } else {
                document.getElementById('telegram-data').textContent = 'Telegram WebApp not detected';
                log('Telegram WebApp not available');
              }
            };

            log('Debug page initialized');
          `,
        }}
      />
    </div>
  )
}

// API test function (server-side)
async function testApiConnection() {
  'use server'
  // This would run on server if needed
}
