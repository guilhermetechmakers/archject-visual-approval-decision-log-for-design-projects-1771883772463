/**
 * Mock data for Client Portal no-login view
 */

import type {
  NoLoginViewPayload,
  BrandingConfig,
  ClientPortalOption,
  ClientPortalComment,
  ClientPortalAnnotation,
  MediaAsset,
} from '@/types/client-portal'

// Sample media URLs for demo - high-quality design/architecture imagery
export const SAMPLE_OPTION_MEDIA_PACK = {
  optionA: [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800',
  ],
  optionB: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
    'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800',
  ],
  optionC: [
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
  ],
}

function createMediaAsset(
  id: string,
  url: string,
  type: MediaAsset['type'] = 'image'
): MediaAsset {
  return {
    id,
    type,
    url,
    thumbnailUrl: url,
  }
}

export const mockNoLoginView: NoLoginViewPayload = {
  decision: {
    id: 'dec-1',
    title: 'Kitchen Finishes - Countertops',
    projectId: 'proj-1',
    createdAt: '2025-02-10T09:00:00Z',
    updatedAt: '2025-02-18T11:00:00Z',
  },
  options: [
    {
      id: 'opt-1',
      title: 'Option A - Quartz',
      description: 'Premium quartz with subtle veining, easy maintenance',
      mediaUrls: [SAMPLE_OPTION_MEDIA_PACK.optionA[0]],
      mediaAssets: [
        createMediaAsset('med-1', SAMPLE_OPTION_MEDIA_PACK.optionA[0]),
        createMediaAsset('med-2', SAMPLE_OPTION_MEDIA_PACK.optionA[1]),
      ],
      annotations: [],
    },
    {
      id: 'opt-2',
      title: 'Option B - Granite',
      description: 'Natural granite, durable finish, timeless appeal',
      mediaUrls: [SAMPLE_OPTION_MEDIA_PACK.optionB[0]],
      mediaAssets: [
        createMediaAsset('med-3', SAMPLE_OPTION_MEDIA_PACK.optionB[0]),
        createMediaAsset('med-4', SAMPLE_OPTION_MEDIA_PACK.optionB[1]),
      ],
      annotations: [],
    },
    {
      id: 'opt-3',
      title: 'Option C - Marble',
      description: 'Carrara marble, classic look, premium feel',
      mediaUrls: [SAMPLE_OPTION_MEDIA_PACK.optionC[0]],
      mediaAssets: [
        createMediaAsset('med-5', SAMPLE_OPTION_MEDIA_PACK.optionC[0]),
      ],
      annotations: [],
    },
  ] as ClientPortalOption[],
  mediaAssets: [],
  comments: [
    {
      id: 'com-1',
      optionId: 'opt-1',
      threadId: null,
      authorId: 'studio-1',
      authorName: 'Sarah Chen',
      text: 'Option A (Quartz) is our recommended choice — best balance of cost and lead time. Please review when you have a moment.',
      createdAt: '2025-02-17T14:00:00Z',
      mentions: [],
    },
    {
      id: 'com-2',
      optionId: 'opt-1',
      threadId: 'com-1',
      authorId: 'client-1',
      authorName: 'Client',
      text: 'Thanks! I prefer the look of Option A. Can we confirm availability before I approve?',
      createdAt: '2025-02-18T09:30:00Z',
      mentions: [],
    },
  ] as ClientPortalComment[],
  annotations: [] as ClientPortalAnnotation[],
  branding: {
    logoUrl: null,
    accentColor: '#195C4A',
    secondaryColor: '#7BE495',
    domainPrefix: null,
    customDomain: null,
  } as BrandingConfig,
  approvals: [],
  linkExpiresAt: '2025-03-15T23:59:59Z',
  requiresOtp: false,
}

export function getMockNoLoginView(_token: string): NoLoginViewPayload {
  return {
    ...mockNoLoginView,
    decision: {
      ...mockNoLoginView.decision,
    },
  }
}

export function getSampleOptionMediaPack() {
  return SAMPLE_OPTION_MEDIA_PACK
}
