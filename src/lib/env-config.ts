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
    
    // Server-side: use NODE_ENV and Vercel detection
    if (typeof window === 'undefined') {
      // If on Vercel, always use production URL
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

    // For production/Vercel, use the actual domain or fallback
    return process.env.NEXT_PUBLIC_SITE_URL_PROD || 
           process.env.NEXT_PUBLIC_SITE_URL || 
           `https://${window.location.hostname}` ||
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