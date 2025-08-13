'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useAuth } from '@/context/AuthContext'

// Types for user profile
export type UserProfile = {
  id: string
  email: string
  name: string
  created_at: string
  last_sign_in_at?: string
  phone?: string
  avatar_url?: string
  bio?: string
  location?: string
  birth_date?: string
  metadata: {
    name?: string
    avatar_url?: string
    email?: string
    email_verified?: boolean
    phone?: string
    phone_verified?: boolean
    provider_id?: string
    sub?: string
  }
}

export type ProfileUpdateData = {
  name: string
  phone?: string
  bio?: string
  location?: string
  birth_date?: string
}

// Hook for fetching user profile
export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())
  const { user } = useAuth()

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Get user data from auth.users
        const { data: userData, error: userError } = await supabase.auth.getUser()
        
        if (userError) throw userError
        if (!userData.user) throw new Error('User not found')

        const authUser = userData.user

        // Map the user data to our profile type
        const userProfile: UserProfile = {
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || '',
          created_at: authUser.created_at,
          last_sign_in_at: authUser.last_sign_in_at || undefined,
          phone: authUser.phone || authUser.user_metadata?.phone || undefined,
          avatar_url: authUser.user_metadata?.avatar_url || undefined,
          bio: authUser.user_metadata?.bio || undefined,
          location: authUser.user_metadata?.location || undefined,
          birth_date: authUser.user_metadata?.birth_date || undefined,
          metadata: authUser.user_metadata || {}
        }

        setProfile(userProfile)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [supabase, user])

  return { profile, loading, error }
}

// Hook for updating user profile
export function useUpdateProfile() {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  const updateProfile = async (updates: ProfileUpdateData) => {
    try {
      setUpdating(true)
      setError(null)

      // Get current user metadata
      const { data: { user }, error: getUserError } = await supabase.auth.getUser()
      if (getUserError) throw getUserError
      if (!user) throw new Error('User not authenticated')

      // Merge new data with existing metadata
      const updatedMetadata = {
        ...user.user_metadata,
        name: updates.name,
        phone: updates.phone,
        bio: updates.bio,
        location: updates.location,
        birth_date: updates.birth_date
      }

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: updatedMetadata
      })

      if (updateError) throw updateError

      // Log the profile update activity
      await supabase.rpc('log_user_activity', {
        p_user_id: user.id,
        p_activity_type: 'profile_update',
        p_description: 'Updated profile information'
      })

      return { success: true }
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      return { success: false, error: err }
    } finally {
      setUpdating(false)
    }
  }

  return { updateProfile, updating, error }
}

// Hook for updating avatar
export function useUpdateAvatar() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  const updateAvatar = async (file: File) => {
    try {
      setUploading(true)
      setError(null)

      const { data: { user }, error: getUserError } = await supabase.auth.getUser()
      if (getUserError) throw getUserError
      if (!user) throw new Error('User not authenticated')

      // Create a unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-avatar-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get the public URL
      const { data } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath)

      const avatarUrl = data.publicUrl

      // Update user metadata with new avatar URL
      const updatedMetadata = {
        ...user.user_metadata,
        avatar_url: avatarUrl
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: updatedMetadata
      })

      if (updateError) throw updateError

      return { success: true, avatarUrl }
    } catch (err) {
      console.error('Error updating avatar:', err)
      setError(err instanceof Error ? err.message : 'Failed to update avatar')
      return { success: false, error: err }
    } finally {
      setUploading(false)
    }
  }

  return { updateAvatar, uploading, error }
}