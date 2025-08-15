// Cache invalidation system that works in both client and server contexts
let settingsCache: {
  data: unknown
  timestamp: number
} | null = null

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function getCache() {
  return settingsCache
}

export function setCache(data: unknown) {
  settingsCache = {
    data,
    timestamp: Date.now()
  }
}

export function invalidateCache() {
  settingsCache = null
}

export function isCacheValid() {
  return settingsCache && (Date.now() - settingsCache.timestamp) < CACHE_DURATION
}

export { CACHE_DURATION }