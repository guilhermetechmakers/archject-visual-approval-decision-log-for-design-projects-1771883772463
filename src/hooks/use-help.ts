import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchGettingStarted,
  updateGettingStartedStep,
  fetchKnowledgeBase,
  fetchArticle,
  fetchFAQs,
  fetchOnboardingGuides,
  updateGuideStep,
  fetchChangelog,
  submitContactSupport,
} from '@/api/help'
import type { SupportRequest } from '@/types/help'

const HELP_KEYS = {
  gettingStarted: ['help', 'getting-started'] as const,
  knowledgeBase: (query?: string, category?: string, page?: number) =>
    ['help', 'knowledge-base', query, category, page] as const,
  article: (id: string) => ['help', 'article', id] as const,
  faqs: (category?: string) => ['help', 'faqs', category] as const,
  guides: ['help', 'onboarding-guides'] as const,
  changelog: ['help', 'changelog'] as const,
}

export function useGettingStarted() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: HELP_KEYS.gettingStarted,
    queryFn: fetchGettingStarted,
  })

  const updateStepMutation = useMutation({
    mutationFn: ({ stepId, completed }: { stepId: string; completed: boolean }) =>
      updateGettingStartedStep(stepId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HELP_KEYS.gettingStarted })
    },
  })

  return {
    ...query,
    data: query.data != null ? { steps: query.data } : undefined,
    updateStep: (stepId: string, completed: boolean) =>
      updateStepMutation.mutateAsync({ stepId, completed }),
    isUpdating: updateStepMutation.isPending,
  }
}

export function useKnowledgeBase(query?: string, category?: string, page = 1) {
  return useQuery({
    queryKey: HELP_KEYS.knowledgeBase(query, category, page),
    queryFn: () =>
      fetchKnowledgeBase({
        query: query?.trim() || undefined,
        category: category === 'All' ? undefined : category,
        page,
      }),
    enabled: true,
  })
}

export function useArticle(id: string | null) {
  return useQuery({
    queryKey: HELP_KEYS.article(id ?? ''),
    queryFn: () => (id ? fetchArticle(id) : Promise.resolve(null)),
    enabled: !!id,
  })
}

export function useFAQs(category?: string) {
  return useQuery({
    queryKey: HELP_KEYS.faqs(category),
    queryFn: () =>
      fetchFAQs({
        category: category === 'All' ? undefined : category,
      }),
  })
}

export function useOnboardingGuides() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: HELP_KEYS.guides,
    queryFn: fetchOnboardingGuides,
  })

  const updateStepMutation = useMutation({
    mutationFn: ({
      guideId,
      stepId,
      completed,
    }: {
      guideId: string
      stepId: string
      completed: boolean
    }) => updateGuideStep(guideId, stepId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HELP_KEYS.guides })
    },
  })

  return {
    ...query,
    updateStep: (guideId: string, stepId: string, completed: boolean) =>
      updateStepMutation.mutateAsync({ guideId, stepId, completed }),
    isUpdating: updateStepMutation.isPending,
  }
}

export function useChangelog() {
  return useQuery({
    queryKey: HELP_KEYS.changelog,
    queryFn: fetchChangelog,
  })
}

export function useContactSupport() {
  const mutation = useMutation({
    mutationFn: (data: {
      subject: string
      description: string
      priority: 'Low' | 'Medium' | 'High'
      attachmentName?: string
    }) =>
      submitContactSupport({
        ...data,
        attachmentName: data.attachmentName,
      }),
  })

  return {
    submit: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
    data: mutation.data as SupportRequest | undefined,
  }
}
