import { useQuery } from '@tanstack/react-query'
import { getPrivacyPolicy } from '@/api/privacy'

export function usePrivacyPolicy() {
  return useQuery({
    queryKey: ['privacy-policy'],
    queryFn: getPrivacyPolicy,
    staleTime: 60 * 60 * 1000,
  })
}
