import { Metadata } from 'next'

interface FallbackRedirectProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export const metadata: Metadata = {
  title: 'Перенаправление',
  description: 'Перенаправление в Telegram Mini App',
}

export default function FallbackRedirect({ searchParams }: FallbackRedirectProps) {
  const targetUrl = searchParams.to as string

  if (!targetUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center text-red-600">
          Ошибка: URL для перенаправления не указан
        </div>
      </div>
    )
  }

  // Decode the URL if it was encoded
  let decodedUrl: string
  try {
    decodedUrl = decodeURIComponent(targetUrl)
  } catch {
    decodedUrl = targetUrl
  }

  return (
    <>
      <head>
        <meta httpEquiv="refresh" content={`0;url=${decodedUrl}`} />
      </head>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-gray-600 text-lg mb-2">
            Сейчас перенаправим…
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <div className="text-sm text-gray-500">
            Если перенаправление не произошло автоматически,{' '}
            <a
              href={decodedUrl}
              className="text-blue-600 hover:underline"
            >
              нажмите здесь
            </a>
          </div>
        </div>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            setTimeout(function() {
              window.location.replace(${JSON.stringify(decodedUrl)});
            }, 100);
          `,
        }}
      />
    </>
  )
}
