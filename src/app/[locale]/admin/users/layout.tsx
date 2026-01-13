'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Download, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslations } from 'next-intl'

export default function AdminUsersLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    const t = useTranslations('admin')

    // Determine active tab based on pathname
    let activeTab = 'overview'
    if (pathname.includes('/admin/users/list')) activeTab = 'users'
    else if (pathname.includes('/admin/users/admins')) activeTab = 'admins'
    else if (pathname.includes('/admin/users/activity')) activeTab = 'activity'

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            {/* Header - No "Back to Admin" button here because Admin Layout has it */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('users.title')}</h1>
                        <p className="text-gray-600 mt-1">
                            {t('users.subtitle')}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="whitespace-nowrap">
                            <Download className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">{t('users.export')}</span>
                            <span className="sm:hidden">{t('users.export')}</span>
                        </Button>
                        <Button size="sm" className="whitespace-nowrap">
                            <UserPlus className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">{t('users.add')}</span>
                            <span className="sm:hidden">{t('users.add')}</span>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <Tabs value={activeTab} className="w-full">
                    <TabsList>
                        <TabsTrigger value="overview" asChild>
                            <Link href="/admin/users">{t('users.tabs.overview')}</Link>
                        </TabsTrigger>
                        <TabsTrigger value="users" asChild>
                            <Link href="/admin/users/list">{t('users.tabs.allUsers')}</Link>
                        </TabsTrigger>
                        <TabsTrigger value="admins" asChild>
                            <Link href="/admin/users/admins">{t('users.tabs.admins')}</Link>
                        </TabsTrigger>
                        <TabsTrigger value="activity" asChild>
                            <Link href="/admin/users/activity">{t('users.tabs.activity')}</Link>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Content Rendered Here */}
                {children}
            </div>
        </div>
    )
}
