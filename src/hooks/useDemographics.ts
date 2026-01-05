'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'

export interface AgeDemographic {
  age_range: string
  user_count: number
  percentage: number
}

export interface GeographicDemographic {
  country: string
  state_province: string
  city: string
  user_count: number
  percentage: number
}

export interface DemographicData {
  ageDistribution: AgeDemographic[]
  geographicDistribution: GeographicDemographic[]
  totalUsers: number
  usersWithDemographicData: number
}

export function useDemographics() {
  const [data, setData] = useState<DemographicData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  const fetchDemographics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch age demographics
      const { data: ageData, error: ageError } = await supabase.rpc('get_age_demographics')
      if (ageError) {
        const errorMessage = ageError.message || ageError.details || 'Failed to fetch age demographics'
        throw new Error(errorMessage)
      }

      // Fetch geographic demographics
      const { data: geoData, error: geoError } = await supabase.rpc('get_geographic_demographics')
      if (geoError) {
        const errorMessage = geoError.message || geoError.details || 'Failed to fetch geographic demographics'
        throw new Error(errorMessage)
      }

      // Calculate totals
      const totalUsersWithAge = ageData?.reduce((sum: number, item: AgeDemographic) => sum + item.user_count, 0) || 0
      const totalUsersWithGeo = geoData?.reduce((sum: number, item: GeographicDemographic) => sum + item.user_count, 0) || 0

      // Get total users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      const demographicData: DemographicData = {
        ageDistribution: ageData || [],
        geographicDistribution: geoData || [],
        totalUsers: totalUsers || 0,
        usersWithDemographicData: Math.max(totalUsersWithAge, totalUsersWithGeo)
      }

      setData(demographicData)
    } catch (err) {
      console.error('Error fetching demographics:', err)
      const errorMessage = err instanceof Error
        ? err.message
        : typeof err === 'object' && err !== null && 'message' in err
          ? String((err as Record<string, unknown>).message)
          : 'Failed to fetch demographics'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchDemographics()
  }, [fetchDemographics])

  return {
    data,
    loading,
    error,
    refetch: fetchDemographics
  }
}

// Hook specifically for age demographics
export function useAgeDemographics() {
  const [data, setData] = useState<AgeDemographic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const fetchAgeData = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data: ageData, error: ageError } = await supabase.rpc('get_age_demographics')
        if (ageError) {
          const errorMessage = ageError.message || ageError.details || 'Failed to fetch age demographics'
          throw new Error(errorMessage)
        }

        setData(ageData || [])
      } catch (err) {
        console.error('Error fetching age demographics:', err)
        const errorMessage = err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as Record<string, unknown>).message)
            : 'Failed to fetch age demographics'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchAgeData()
  }, [supabase])

  return { data, loading, error }
}

// Hook specifically for geographic demographics
export function useGeographicDemographics() {
  const [data, setData] = useState<GeographicDemographic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data: geoData, error: geoError } = await supabase.rpc('get_geographic_demographics')
        if (geoError) {
          const errorMessage = geoError.message || geoError.details || 'Failed to fetch geographic demographics'
          throw new Error(errorMessage)
        }

        setData(geoData || [])
      } catch (err) {
        console.error('Error fetching geographic demographics:', err)
        const errorMessage = err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as Record<string, unknown>).message)
            : 'Failed to fetch geographic demographics'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchGeoData()
  }, [supabase])

  return { data, loading, error }
}