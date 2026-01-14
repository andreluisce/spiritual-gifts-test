"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { usePublicSettings } from "@/hooks/usePublicSettings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FcGoogle } from "react-icons/fc"
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { LanguageToggle } from '@/components/LanguageToggle'
import { createClient } from '@/lib/supabase-client'

export function LoginForm() {
    const { signInWithGoogle } = useAuth()
    const { canRegister, loading: settingsLoading } = usePublicSettings()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [email, setEmail] = useState<string>('')
    const [magicLinkSent, setMagicLinkSent] = useState(false)
    const [showEmailForm, setShowEmailForm] = useState(false)
    const t = useTranslations('login')
    const supabase = createClient()

    async function handleGoogleLogin() {
        setLoading(true)
        setError(null)

        try {
            if (!canRegister) {
                setError('Registro de novos usuários está temporariamente desabilitado.')
                setLoading(false)
                return
            }

            await signInWithGoogle()
        } catch (error) {
            setLoading(false)
            setError(error instanceof Error ? error.message : 'Erro ao fazer login')
        }
    }

    async function handleMagicLinkLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (!canRegister) {
                setError('Registro de novos usuários está temporariamente desabilitado.')
                setLoading(false)
                return
            }

            const { error } = await supabase.auth.signInWithOtp({
                email: email.trim(),
                options: {
                    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://descubraseudom.online'}/auth/callback`,
                }
            })

            if (error) throw error

            setMagicLinkSent(true)
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Erro ao enviar link mágico')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
            {/* Language Toggle - Top Right */}
            <div className="absolute top-4 right-4 z-20">
                <LanguageToggle size="sm" />
            </div>

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
                                {magicLinkSent ? 'Verifique seu email' : t('createAccount')}
                            </h1>
                            <p className="text-gray-600 text-sm">
                                {magicLinkSent
                                    ? 'Enviamos um link mágico para você'
                                    : t('subtitle')
                                }
                            </p>
                        </motion.div>
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-8 space-y-4">
                        <AnimatePresence mode="wait">
                            {magicLinkSent ? (
                                // Success State
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="text-center py-8"
                                >
                                    <div className="mb-6 flex justify-center">
                                        <div className="bg-green-100 rounded-full p-4">
                                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Link enviado!
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-6">
                                        Enviamos um link de acesso para <strong>{email}</strong>
                                    </p>
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left">
                                        <p className="text-blue-900 text-sm font-medium mb-2">
                                            📧 Próximos passos:
                                        </p>
                                        <ol className="text-blue-800 text-xs space-y-1 list-decimal list-inside">
                                            <li>Abra seu email</li>
                                            <li>Clique no link que enviamos</li>
                                            <li>Você será conectado automaticamente</li>
                                        </ol>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setMagicLinkSent(false)
                                            setEmail('')
                                            setShowEmailForm(false)
                                        }}
                                        className="mt-4 text-gray-600"
                                    >
                                        Voltar
                                    </Button>
                                </motion.div>
                            ) : (
                                // Login Options
                                <motion.div
                                    key="login"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-4"
                                >
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="p-3 bg-red-50 border border-red-200 rounded-xl"
                                        >
                                            <p className="text-red-600 text-sm text-center">{error}</p>
                                        </motion.div>
                                    )}

                                    {!canRegister && !settingsLoading ? (
                                        <div className="text-center py-6">
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                                <p className="text-yellow-800 text-sm font-medium">
                                                    🔒 Registro Temporariamente Desabilitado
                                                </p>
                                                <p className="text-yellow-700 text-xs mt-1">
                                                    Novos registros estão suspensos no momento.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Email Form */}
                                            <AnimatePresence>
                                                {showEmailForm && (
                                                    <motion.form
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        onSubmit={handleMagicLinkLogin}
                                                        className="space-y-3"
                                                    >
                                                        <div>
                                                            <Input
                                                                type="email"
                                                                placeholder="seu@email.com"
                                                                value={email}
                                                                onChange={(e) => setEmail(e.target.value)}
                                                                required
                                                                className="h-12 rounded-xl"
                                                                disabled={loading}
                                                            />
                                                        </div>
                                                        <Button
                                                            type="submit"
                                                            className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-xl"
                                                            disabled={loading || !email}
                                                        >
                                                            {loading ? (
                                                                'Enviando...'
                                                            ) : (
                                                                <>
                                                                    Enviar Link Mágico
                                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                                </>
                                                            )}
                                                        </Button>
                                                    </motion.form>
                                                )}
                                            </AnimatePresence>

                                            {/* Magic Link Button */}
                                            {!showEmailForm && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3 }}
                                                >
                                                    <Button
                                                        type="button"
                                                        className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-xl flex items-center justify-center gap-3"
                                                        onClick={() => setShowEmailForm(true)}
                                                    >
                                                        <Mail className="h-5 w-5" />
                                                        Entrar com Email
                                                    </Button>
                                                </motion.div>
                                            )}

                                            {/* Divider */}
                                            <div className="relative">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-gray-200"></div>
                                                </div>
                                                <div className="relative flex justify-center text-xs">
                                                    <span className="px-2 bg-white text-gray-500">ou</span>
                                                </div>
                                            </div>

                                            {/* Google Button */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5 }}
                                            >
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 font-medium border-gray-200 rounded-xl flex items-center justify-center gap-3"
                                                    onClick={handleGoogleLogin}
                                                    disabled={loading || settingsLoading}
                                                >
                                                    <FcGoogle className="text-xl" />
                                                    {loading ? t('signingIn') : t('continueWithGoogle')}
                                                </Button>
                                            </motion.div>
                                        </>
                                    )}

                                    <motion.p
                                        className="text-gray-500 text-xs text-center leading-relaxed pt-2"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        {t('agreement')}
                                    </motion.p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Plant Mascot */}
                    {!magicLinkSent && (
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
                    )}
                </div>
            </motion.div>
        </div>
    )
}
