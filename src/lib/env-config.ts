// Environment configuration utility
export const getEnvironmentConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('localhost'))

  // Determine the base URL based on environment
  const getBaseUrl = () => {
    // Vercel specific environment detection
    const isVercel = process.env.VERCEL || process.env.VERCEL_URL
    const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL

    // Server-side: use NODE_ENV and Vercel detection
    if (typeof window === 'undefined') {
      // If on Vercel preview/development deployment, use the Vercel URL
      if (isVercel && vercelUrl) {
        // Ensure the Vercel URL has https:// protocol
        const url = vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`
        return url
      }

      // If on Vercel production or custom domain
      if (isVercel && !isDevelopment) {
        return process.env.NEXT_PUBLIC_SITE_URL_PROD || process.env.NEXT_PUBLIC_SITE_URL || 'https://descubraseudom.online'
      }

      return isDevelopment
        ? process.env.NEXT_PUBLIC_SITE_URL_DEV || 'http://localhost:3000'
        : process.env.NEXT_PUBLIC_SITE_URL_PROD || process.env.NEXT_PUBLIC_SITE_URL || 'https://descubraseudom.online'
    }

    // Client-side: detect from window.location
    if (isLocalhost) {
      return process.env.NEXT_PUBLIC_SITE_URL_DEV || 'http://localhost:3000'
    }

    // For production/Vercel, use the actual domain from the browser
    // This ensures preview deployments work correctly
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol
      const hostname = window.location.hostname

      // If we're on a Vercel preview URL, use it
      if (hostname.includes('vercel.app')) {
        return `${protocol}//${hostname}`
      }
    }

    // For production/Vercel, use the configured domain or fallback
    return process.env.NEXT_PUBLIC_SITE_URL_PROD ||
           process.env.NEXT_PUBLIC_SITE_URL ||
           (typeof window !== 'undefined' ? `https://${window.location.hostname}` : '') ||
           'https://descubraseudom.online'
  }

  const baseUrl = getBaseUrl()

  return {
    isDevelopment: isDevelopment || isLocalhost,
    isVercel: !!(process.env.VERCEL || process.env.VERCEL_URL),
    baseUrl,
    authCallbackUrl: (locale: string) => `${baseUrl}/${locale}/auth/callback`
  }
}

// Export for backward compatibility
export const getSiteUrl = () => getEnvironmentConfig().baseUrl