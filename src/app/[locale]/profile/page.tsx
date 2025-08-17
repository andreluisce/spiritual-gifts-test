'use client'

import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from '@/i18n/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Phone,
  FileText,
  Camera,
  Save,
  ArrowLeft,
  Edit3,
  CheckCircle,
  Clock,
  Activity,
  Globe,
  Building
} from 'lucide-react'
import Link from 'next/link'
import { LanguageToggleCompact } from '@/components/LanguageToggle'
import { useProfile, useUpdateProfile, useUpdateAvatar, ProfileUpdateData } from '@/hooks/useProfile'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUserActivities } from '@/hooks/useUserActivity'
import { useTranslations } from 'next-intl'

// Validation schema for profile editing
type ProfileEditForm = {
  name: string
  phone?: string
  bio?: string
  location?: string
  birth_date?: string
  age_range?: string
  country?: string
  city?: string
  state_province?: string
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const t = useTranslations('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  // Fetch profile data
  const { profile, loading: profileLoading } = useProfile()
  const { updateProfile, updating } = useUpdateProfile()
  const { updateAvatar, uploading } = useUpdateAvatar()
  const { activities, loading: activitiesLoading } = useUserActivities(10, user?.id)

  // Create schema with translations
  const createProfileSchema = () => z.object({
    name: z.string().min(1, t('validation.nameRequired')).max(100, t('validation.nameMaxLength')),
    phone: z.string().optional(),
    bio: z.string().max(500, t('validation.bioMaxLength')).optional(),
    location: z.string().max(100, t('validation.locationMaxLength')).optional(),
    birth_date: z.string().optional(),
    age_range: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    state_province: z.string().optional()
  })

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ProfileEditForm>({
    resolver: zodResolver(createProfileSchema()),
    defaultValues: {
      name: '',
      phone: '',
      bio: '',
      location: '',
      birth_date: '',
      age_range: '',
      country: '',
      city: '',
      state_province: ''
    }
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        location: profile.location || '',
        birth_date: profile.birth_date || '',
        age_range: (profile as { age_range?: string }).age_range || '',
        country: (profile as { country?: string }).country || '',
        city: (profile as { city?: string }).city || '',
        state_province: (profile as { state_province?: string }).state_province || ''
      })
    }
  }, [profile, reset])

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  const handleSaveProfile = async (data: ProfileEditForm) => {
    try {
      // Update avatar first if selected
      if (avatarFile) {
        const avatarResult = await updateAvatar(avatarFile)
        if (!avatarResult.success) {
          alert(t('alerts.avatarError') + ' ' + avatarResult.error)
          return
        }
      }

      // Update profile data
      const result = await updateProfile(data as ProfileUpdateData)

      if (result.success) {
        setIsEditing(false)
        setAvatarFile(null)
        setAvatarPreview(null)
        setShowSuccessDialog(true)
      } else {
        alert(t('alerts.profileError') + ' ' + result.error)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert(t('alerts.profileError') + ' ' + error)
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <User className="h-4 w-4" />
      case 'quiz_start': return <FileText className="h-4 w-4" />
      case 'quiz_complete': return <CheckCircle className="h-4 w-4" />
      case 'profile_update': return <Edit3 className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login': return 'bg-green-100 text-green-600'
      case 'quiz_start': return 'bg-blue-100 text-blue-600'
      case 'quiz_complete': return 'bg-purple-100 text-purple-600'
      case 'profile_update': return 'bg-yellow-100 text-yellow-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const formatActivityTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return t('activities.timeAgo.seconds', { count: diffInSeconds })
    if (diffInSeconds < 3600) return t('activities.timeAgo.minutes', { count: Math.floor(diffInSeconds / 60) })
    if (diffInSeconds < 86400) return t('activities.timeAgo.hours', { count: Math.floor(diffInSeconds / 3600) })
    return t('activities.timeAgo.days', { count: Math.floor(diffInSeconds / 86400) })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="p-2 sm:p-4 m-1 sm:m-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToDashboard')}
            </Button>
          </Link>
          <LanguageToggleCompact />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-gray-600 mt-1">
              {t('subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4 mr-2" />
                {t('editProfile')}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setIsEditing(false)
                  setAvatarFile(null)
                  setAvatarPreview(null)
                  reset()
                }}>
                  {t('cancel')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('personalInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleSaveProfile)} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                    {avatarPreview || profile.avatar_url ? (
                      <Image 
                        src={avatarPreview || profile.avatar_url || '/default-avatar.png'} 
                        alt="Avatar"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-blue-600 font-semibold text-2xl">
                        {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{profile.name}</h3>
                  <p className="text-gray-500 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </p>
                  <p className="text-gray-500 flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {t('memberSince')} {formatDate(profile.created_at)}
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t('fields.fullName')}
                  </label>
                  <Input
                    {...register('name')}
                    disabled={!isEditing}
                    placeholder={isEditing ? t('fields.fullNamePlaceholder') : ""}
                    className={`${errors.name ? 'border-red-500' : ''} ${!isEditing ? 'bg-gray-50' : ''}`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {t('fields.phone')}
                  </label>
                  <Input
                    {...register('phone')}
                    disabled={!isEditing}
                    placeholder={isEditing ? t('fields.phonePlaceholder') : ""}
                    value={!isEditing ? (profile?.phone || t('notProvided')) : undefined}
                    className={`${!isEditing ? 'bg-gray-50' : ''}`}
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {t('fields.location')}
                  </label>
                  <Input
                    {...register('location')}
                    disabled={!isEditing}
                    placeholder={isEditing ? t('fields.locationPlaceholder') : ""}
                    value={!isEditing ? (profile?.location || t('notProvided')) : undefined}
                    className={`${!isEditing ? 'bg-gray-50' : ''}`}
                  />
                </div>

                {/* Birth Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t('fields.birthDate')}
                  </label>
                  <Input
                    {...register('birth_date')}
                    type="date"
                    disabled={!isEditing}
                    className={`${!isEditing ? 'bg-gray-50' : ''}`}
                  />
                </div>

                {/* Age Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t('fields.ageRange')}
                  </label>
                  <Select
                    value={(profile as { age_range?: string })?.age_range || ''}
                    onValueChange={(value) => {
                      register('age_range').onChange({ target: { value } })
                    }}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className={`${!isEditing ? 'bg-gray-50' : ''}`}>
                      <SelectValue placeholder={isEditing ? t('fields.ageRangePlaceholder') : ((profile as { age_range?: string })?.age_range ? t(`fields.ageRanges.${(profile as { age_range?: string }).age_range}`) : t('notProvided'))} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-24">{t('fields.ageRanges.18-24')}</SelectItem>
                      <SelectItem value="25-34">{t('fields.ageRanges.25-34')}</SelectItem>
                      <SelectItem value="35-44">{t('fields.ageRanges.35-44')}</SelectItem>
                      <SelectItem value="45-54">{t('fields.ageRanges.45-54')}</SelectItem>
                      <SelectItem value="55-64">{t('fields.ageRanges.55-64')}</SelectItem>
                      <SelectItem value="65+">{t('fields.ageRanges.65+')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {t('fields.country')}
                  </label>
                  <Input
                    {...register('country')}
                    disabled={!isEditing}
                    placeholder={isEditing ? t('fields.countryPlaceholder') : ""}
                    value={!isEditing ? ((profile as { country?: string })?.country || t('notProvided')) : undefined}
                    className={`${!isEditing ? 'bg-gray-50' : ''}`}
                  />
                </div>

                {/* State/Province */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {t('fields.state')}
                  </label>
                  <Input
                    {...register('state_province')}
                    disabled={!isEditing}
                    placeholder={isEditing ? t('fields.statePlaceholder') : ""}
                    value={!isEditing ? ((profile as { state_province?: string })?.state_province || t('notProvided')) : undefined}
                    className={`${!isEditing ? 'bg-gray-50' : ''}`}
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {t('fields.city')}
                  </label>
                  <Input
                    {...register('city')}
                    disabled={!isEditing}
                    placeholder={isEditing ? t('fields.cityPlaceholder') : ""}
                    value={!isEditing ? ((profile as { city?: string })?.city || t('notProvided')) : undefined}
                    className={`${!isEditing ? 'bg-gray-50' : ''}`}
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t('fields.bio')}
                </label>
                <Textarea
                  {...register('bio')}
                  disabled={!isEditing}
                  placeholder={isEditing ? t('fields.bioPlaceholder') : ""}
                  value={!isEditing ? (profile?.bio || t('notProvided')) : undefined}
                  rows={4}
                  className={`${errors.bio ? 'border-red-500' : ''} ${!isEditing ? 'bg-gray-50' : ''}`}
                />
                {errors.bio && (
                  <p className="text-xs text-red-500">{errors.bio.message}</p>
                )}
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || updating || uploading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting || updating || uploading ? t('saving') : t('saveChanges')}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {t('recentActivities')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-4">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className={`p-2 rounded-full ${getActivityColor(activity.activity_type)}`}>
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.activity_description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <Clock className="h-3 w-3" />
                        {formatActivityTime(activity.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{t('activities.noActivities')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              {t('alerts.success')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('alerts.updateSuccess')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowSuccessDialog(false)
                window.location.reload()
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </div>
      </div>
    </div>
  )
}