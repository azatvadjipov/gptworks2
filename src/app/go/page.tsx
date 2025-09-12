import { redirect } from 'next/navigation'

interface GoPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function GoPage({ searchParams }: GoPageProps) {
  const memberParam = searchParams.member
  const isMember = memberParam === 'true'

  const memberRedirectUrl = process.env.MEMBER_REDIRECT_URL
  const nonMemberRedirectUrl = process.env.NON_MEMBER_REDIRECT_URL
  const enableFallback = process.env.ENABLE_FALLBACK_REDIRECT === 'true'

  if (!memberRedirectUrl || !nonMemberRedirectUrl) {
    console.error('Redirect URLs not configured')
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center text-red-600">
          Ошибка конфигурации сервера
        </div>
      </div>
    )
  }

  const targetUrl = isMember ? memberRedirectUrl : nonMemberRedirectUrl

  try {
    // Try server-side redirect first
    redirect(targetUrl)
  } catch {
    // If redirect fails (e.g., in some WebView environments), use fallback
    if (enableFallback) {
      const fallbackUrl = `/fallback-redirect?to=${encodeURIComponent(targetUrl)}`
      redirect(fallbackUrl)
    }

    // If all else fails, show error
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Ошибка перенаправления
          </div>
          <div className="text-gray-600 mb-4">
            Не удалось выполнить перенаправление
          </div>
          <a
            href={targetUrl}
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Перейти вручную
          </a>
        </div>
      </div>
    )
  }
}
