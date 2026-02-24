import { useQuery } from '@tanstack/react-query'
import { getPrivacyPolicy, getRegions } from '@/api/legal'

export function usePrivacyPolicy() {
  return useQuery({
    queryKey: ['privacy-policy'],
    queryFn: getPrivacyPolicy,
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

export function useRegions() {
  return useQuery({
    queryKey: ['regions'],
    queryFn: getRegions,
    staleTime: 60 * 60 * 1000,
  })
}
