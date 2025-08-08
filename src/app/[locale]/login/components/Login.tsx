"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc"
import { motion } from "framer-motion"
import Image from 'next/image'
import { useTranslations } from 'next-intl'

export function LoginForm() {
    const { signInWithGoogle } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const t = useTranslations('login')

    async function handleGoogleLogin() {
        setLoading(true)
        setError(null)

        const { error } = await signInWithGoogle()

        setLoading(false)
        if (error) {
            setError(error.message)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
            {/* Decorative circles */}
            <div className="absolute top-20 left-20 w-32 h-32 bg-purple-100 rounded-full opacity-60 blur-xl"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-100 rounded-full opacity-40 blur-xl"></div>
            <div className="absolute top-1/2 left-10 w-24 h-24 bg-green-100 rounded-full opacity-50 blur-xl"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="text-center pt-12 pb-8 px-6">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="mb-6"
                        >
                            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                                {t('createAccount')}
                            </h1>
                            <p className="text-gray-600 text-sm">
                                {t('subtitle')}
                            </p>
                        </motion.div>
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-8 space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-3 bg-red-50 border border-red-200 rounded-xl"
                            >
                                <p className="text-red-600 text-sm text-center">{error}</p>
                            </motion.div>
                        )}

                        {/* Google button (secondary) */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                        >
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 font-medium border-gray-200 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 shadow-sm hover:shadow-md"
                                onClick={handleGoogleLogin}
                                disabled={loading}
                            >
                                <FcGoogle className="text-xl" />
                                {loading ? t('signingIn') : t('continueWithGoogle')}
                            </Button>
                        </motion.div>

                        <motion.p
                            className="text-gray-500 text-xs text-center leading-relaxed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                        >
                            {t('agreement')}
                        </motion.p>
                    </div>

                    {/* Plant Mascot */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="flex justify-center pb-8"
                    >
                        <Image
                            src="/plant-mascot.svg"
                            alt="Plant mascot"
                            width={120}
                            height={150}
                            className="drop-shadow-sm"
                        />
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}
