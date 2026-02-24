import { useQuery } from '@tanstack/react-query'
import { getTermsOfService } from '@/api/legal'

export function useTermsOfService() {
  return useQuery({
    queryKey: ['terms-of-service'],
    queryFn: getTermsOfService,
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}
