/**
 * Returns color classes for a given spiritual gift category.
 * Includes explicit styles for both screen (colorful) and print (minimalist).
 */

export const GIFT_HEX_COLORS: Record<string, string> = {
    'Profecia': '#7c3aed', // violet-600
    'Prophecy': '#7c3aed',
    'Serviço': '#0284c7', // sky-600
    'Ministério': '#0284c7',
    'Service': '#0284c7',
    'Ensino': '#4f46e5', // indigo-600
    'Teaching': '#4f46e5',
    'Exortação': '#d97706', // amber-600
    'Exhortation': '#d97706',
    'Contribuição': '#059669', // emerald-600
    'Giving': '#059669',
    'Liderança': '#e11d48', // rose-600
    'Leadership': '#e11d48',
    'Misericórdia': '#0d9488', // teal-600
    'Mercy': '#0d9488',
    'default': '#6b7280' // gray-500
}

export const getGiftColor = (category: string) => {
    const norm = category?.toLowerCase().trim() || ''

    if (norm.includes('profecia') || norm.includes('prophecy')) {
        return {
            bg: 'bg-violet-50 print:bg-white',
            border: 'border-violet-100 print:border-gray-200 print:border-l-4 print:border-l-violet-600',
            text: 'text-violet-900 print:text-gray-900',
            iconBg: 'bg-violet-100 print:bg-transparent',
            iconText: 'text-violet-700 print:text-gray-500',
            badge: 'border-violet-200 text-violet-800 bg-violet-50/50 print:border-gray-300 print:text-gray-700 print:bg-transparent'
        }
    }

    if (norm.includes('serviço') || norm.includes('service') || norm.includes('ministério')) {
        return {
            bg: 'bg-sky-50 print:bg-white',
            border: 'border-sky-100 print:border-gray-200 print:border-l-4 print:border-l-sky-600',
            text: 'text-sky-900 print:text-gray-900',
            iconBg: 'bg-sky-100 print:bg-transparent',
            iconText: 'text-sky-700 print:text-gray-500',
            badge: 'border-sky-200 text-sky-800 bg-sky-50/50 print:border-gray-300 print:text-gray-700 print:bg-transparent'
        }
    }

    if (norm.includes('ensino') || norm.includes('teaching')) {
        return {
            bg: 'bg-indigo-50 print:bg-white',
            border: 'border-indigo-100 print:border-gray-200 print:border-l-4 print:border-l-indigo-600',
            text: 'text-indigo-900 print:text-gray-900',
            iconBg: 'bg-indigo-100 print:bg-transparent',
            iconText: 'text-indigo-700 print:text-gray-500',
            badge: 'border-indigo-200 text-indigo-800 bg-indigo-50/50 print:border-gray-300 print:text-gray-700 print:bg-transparent'
        }
    }

    if (norm.includes('exortação') || norm.includes('exhortation') || norm.includes('encoraja')) {
        return {
            bg: 'bg-amber-50 print:bg-white',
            border: 'border-amber-100 print:border-gray-200 print:border-l-4 print:border-l-amber-600',
            text: 'text-amber-900 print:text-gray-900',
            iconBg: 'bg-amber-100 print:bg-transparent',
            iconText: 'text-amber-700 print:text-gray-500',
            badge: 'border-amber-200 text-amber-800 bg-amber-50/50 print:border-gray-300 print:text-gray-700 print:bg-transparent'
        }
    }

    if (norm.includes('contribui') || norm.includes('giving')) {
        return {
            bg: 'bg-emerald-50 print:bg-white',
            border: 'border-emerald-100 print:border-gray-200 print:border-l-4 print:border-l-emerald-600',
            text: 'text-emerald-900 print:text-gray-900',
            iconBg: 'bg-emerald-100 print:bg-transparent',
            iconText: 'text-emerald-700 print:text-gray-500',
            badge: 'border-emerald-200 text-emerald-800 bg-emerald-50/50 print:border-gray-300 print:text-gray-700 print:bg-transparent'
        }
    }

    if (norm.includes('liderança') || norm.includes('leadership')) {
        return {
            bg: 'bg-rose-50 print:bg-white',
            border: 'border-rose-100 print:border-gray-200 print:border-l-4 print:border-l-rose-600',
            text: 'text-rose-900 print:text-gray-900',
            iconBg: 'bg-rose-100 print:bg-transparent',
            iconText: 'text-rose-700 print:text-gray-500',
            badge: 'border-rose-200 text-rose-800 bg-rose-50/50 print:border-rose-300 print:text-gray-700 print:bg-transparent'
        }
    }

    if (norm.includes('misericórdia') || norm.includes('mercy')) {
        return {
            bg: 'bg-teal-50 print:bg-white',
            border: 'border-teal-100 print:border-gray-200 print:border-l-4 print:border-l-teal-600',
            text: 'text-teal-900 print:text-gray-900',
            iconBg: 'bg-teal-100 print:bg-transparent',
            iconText: 'text-teal-700 print:text-gray-500',
            badge: 'border-teal-200 text-teal-800 bg-teal-50/50 print:border-gray-300 print:text-gray-700 print:bg-transparent'
        }
    }

    return {
        bg: 'bg-gray-50 print:bg-white',
        border: 'border-gray-200',
        text: 'text-gray-900',
        iconBg: 'bg-gray-100 print:bg-transparent',
        iconText: 'text-gray-700 print:text-gray-500',
        badge: 'border-gray-200 text-gray-700'
    }
}
