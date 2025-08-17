// Environment configuration utility
export const getEnvironmentConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('localhost'))

  // Determine the base URL based on environment
  const getBaseUrl = () => {
    // Server-side: use NODE_ENV
    if (typeof window === 'undefined') {
      return isDevelopment
        ? process.env.NEXT_PUBLIC_SITE_URL_DEV
        : process.env.NEXT_PUBLIC_SITE_URL_PROD
    }

    // Client-side: detect from window.location
    if (isLocalhost) {
      return process.env.NEXT_PUBLIC_SITE_URL_DEV || 'http://localhost:3000'
    }

    return process.env.NEXT_PUBLIC_SITE_URL_PROD || 'https://descubraseudom.online'
  }

  const baseUrl = getBaseUrl()

  return {
    isDevelopment: isDevelopment || isLocalhost,
    baseUrl,
    authCallbackUrl: (locale: string) => `${baseUrl}/${locale}/auth/callback`
  }
}

// Export for backward compatibility
export const getSiteUrl = () => getEnvironmentConfig().baseUrl