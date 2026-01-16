// Google Analytics 4 Configuration and Utilities
// Based on Next.js 15 App Router best practices

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// Check if GA is enabled
export const isGAEnabled = (): boolean => {
    return !!GA_MEASUREMENT_ID && process.env.NODE_ENV === 'production'
}

// Types for GA events
export interface GAEvent {
    action: string
    category: string
    label?: string
    value?: number
}

// Page view tracking
export const pageview = (url: string): void => {
    if (!isGAEnabled()) return

    window.gtag('config', GA_MEASUREMENT_ID!, {
        page_path: url,
    })
}

// Event tracking
export const event = ({ action, category, label, value }: GAEvent): void => {
    if (!isGAEnabled()) return

    window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
    })
}

// Custom events for spiritual gifts app
export const trackQuizEvent = (action: 'start' | 'complete' | 'abandon', data?: Record<string, unknown>) => {
    event({
        action,
        category: 'Quiz',
        label: data?.step as string,
        value: data?.progress as number,
    })
}

export const trackGiftView = (giftKey: string, giftName: string) => {
    event({
        action: 'view_gift',
        category: 'Content',
        label: `${giftKey} - ${giftName}`,
    })
}

export const trackResultShare = (platform: string) => {
    event({
        action: 'share',
        category: 'Social',
        label: platform,
    })
}

export const trackUserEngagement = (action: string, label?: string) => {
    event({
        action,
        category: 'Engagement',
        label,
    })
}

// User properties
export const setUserProperties = (properties: Record<string, unknown>) => {
    if (!isGAEnabled()) return

    window.gtag('set', 'user_properties', properties)
}

// Track user authentication
export const trackAuth = (method: 'google' | 'magic_link', userId?: string) => {
    event({
        action: 'login',
        category: 'Authentication',
        label: method,
    })

    if (userId) {
        window.gtag('config', GA_MEASUREMENT_ID!, {
            user_id: userId
        })
    }
}

// Track errors
export const trackError = (error: string, fatal: boolean = false) => {
    event({
        action: 'exception',
        category: 'Error',
        label: error,
        value: fatal ? 1 : 0,
    })
}

// Declare gtag function for TypeScript
declare global {
    interface Window {
        gtag: (
            command: 'config' | 'event' | 'set',
            targetId: string,
            config?: Record<string, unknown>
        ) => void
    }
}
