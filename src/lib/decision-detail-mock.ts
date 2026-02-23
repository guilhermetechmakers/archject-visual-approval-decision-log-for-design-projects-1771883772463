/**
 * Mock data for Decision Detail - used when API is not available
 */

import type { DecisionDetailFull } from '@/types/decision-detail'

export const mockDecisionDetail: DecisionDetailFull = {
  decision: {
    id: 'dec-1',
    projectId: 'proj-1',
    title: 'Kitchen Finishes - Countertops',
    description: 'Select countertop material and finish for kitchen island.',
    status: 'pending',
    createdAt: '2025-02-10T09:00:00Z',
    updatedAt: '2025-02-18T11:00:00Z',
    dueDate: '2025-03-01',
    assignees: ['user-2'],
    assigneeNames: ['Sarah Chen'],
    ownerId: 'user-1',
    lastActionTime: '2025-02-18T11:00:00Z',
  },
  options: [
    {
      id: 'opt-1',
      decisionId: 'dec-1',
      title: 'Option A - Quartz',
      description: 'Premium quartz with subtle veining',
      cost: '$4,200',
      leadTime: 14,
      dependencies: ['Supplier confirmation'],
      isRecommended: true,
      order: 0,
      attachments: [
        {
          id: 'med-1',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
          version: 1,
          uploadedAt: '2025-02-15T10:00:00Z',
          uploadedBy: 'user-2',
          size: 245000,
        },
      ],
      mediaPreviewIds: ['med-1'],
    },
    {
      id: 'opt-2',
      decisionId: 'dec-1',
      title: 'Option B - Granite',
      description: 'Natural granite, durable finish',
      cost: '$3,800',
      leadTime: 21,
      dependencies: ['Stone yard availability'],
      isRecommended: false,
      order: 1,
      attachments: [
        {
          id: 'med-2',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
          version: 1,
          uploadedAt: '2025-02-15T10:30:00Z',
          uploadedBy: 'user-2',
          size: 312000,
        },
      ],
      mediaPreviewIds: ['med-2'],
    },
    {
      id: 'opt-3',
      decisionId: 'dec-1',
      title: 'Option C - Marble',
      description: 'Carrara marble, classic look',
      cost: '$5,100',
      leadTime: 28,
      dependencies: ['Import lead time'],
      isRecommended: false,
      order: 2,
      attachments: [],
      mediaPreviewIds: [],
    },
  ],
  comments: [
    {
      id: 'com-1',
      decisionId: 'dec-1',
      parentCommentId: null,
      authorId: 'user-2',
      authorName: 'Sarah Chen',
      content: 'Option A (Quartz) is our recommended choice — best balance of cost and lead time. @Client Contact please review when you have a moment.',
      createdAt: '2025-02-17T14:00:00Z',
      mentions: ['user-3'],
    },
    {
      id: 'com-2',
      decisionId: 'dec-1',
      parentCommentId: 'com-1',
      authorId: 'user-3',
      authorName: 'Client Contact',
      content: 'Thanks Sarah. I prefer the look of Option A. Can we confirm availability before I approve?',
      createdAt: '2025-02-18T09:30:00Z',
      mentions: [],
    },
  ],
  annotations: [],
  approvals: [
    {
      id: 'app-1',
      decisionId: 'dec-1',
      actorId: 'user-1',
      actorName: 'Alex Morgan',
      role: 'owner',
      action: 'updated',
      timestamp: '2025-02-10T09:00:00Z',
      ipAddress: null,
    },
    {
      id: 'app-2',
      decisionId: 'dec-1',
      actorId: 'user-2',
      actorName: 'Sarah Chen',
      role: 'editor',
      action: 'updated',
      timestamp: '2025-02-18T11:00:00Z',
      ipAddress: null,
    },
  ],
  files: [
    {
      id: 'file-2',
      decisionId: 'dec-1',
      fileName: 'countertop-specs.pdf',
      url: '/files/countertop-specs.pdf',
      version: 1,
      fileType: 'spec',
      uploadedAt: '2025-02-15T09:30:00Z',
      uploadedBy: 'user-2',
    },
  ],
}

export function getMockDecisionDetail(decisionId: string): DecisionDetailFull {
  return {
    ...mockDecisionDetail,
    decision: {
      ...mockDecisionDetail.decision,
      id: decisionId,
    },
  }
}
