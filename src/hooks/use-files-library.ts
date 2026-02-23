/**
 * React Query hooks for Files & Drawings Library
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import * as filesApi from '@/api/files-library'
import {
  mockLibraryFiles,
  mockFileVersions,
} from '@/lib/files-library-mock'
import type {
  LibraryFile,
  FileFilters,
  UploadProgress,
} from '@/types/files-library'
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  VERSION_NOTES_MIN,
  VERSION_NOTES_MAX,
} from '@/types/files-library'

const USE_MOCK = true

function filterFiles(
  files: LibraryFile[],
  filters: FileFilters
): LibraryFile[] {
  let result = [...files]
  if (filters.type?.length) {
    result = result.filter((f) => filters.type!.includes(f.type))
  }
  if (filters.dateFrom) {
    result = result.filter((f) => f.uploadedAt >= filters.dateFrom!)
  }
  if (filters.dateTo) {
    result = result.filter((f) => f.uploadedAt <= filters.dateTo!)
  }
  if (filters.linkedDecision === true) {
    result = result.filter((f) => f.linkedDecisionsCount > 0)
  }
  if (filters.linkedDecision === false) {
    result = result.filter((f) => f.linkedDecisionsCount === 0)
  }
  if (filters.search?.trim()) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.type.toLowerCase().includes(q)
    )
  }
  return result
}

export function useFilesLibrary(
  projectId: string,
  filters: FileFilters = {}
) {
  return useQuery({
    queryKey: ['files-library', projectId, filters],
    queryFn: async () => {
      if (USE_MOCK) {
        const projectFiles = mockLibraryFiles
          .filter((f) => f.projectId === 'proj-1' || f.projectId === projectId)
          .map((f) => ({ ...f, projectId }))
        const filtered = filterFiles(projectFiles, filters)
        return {
          files: filtered,
          total: filtered.length,
          page: 1,
          limit: 50,
        }
      }
      return filesApi.fetchProjectFiles(projectId, filters)
    },
    enabled: !!projectId,
  })
}

export function useFileDetail(projectId: string, fileId: string | null) {
  return useQuery({
    queryKey: ['files-library', 'detail', projectId, fileId],
    queryFn: async () => {
      if (USE_MOCK && fileId) {
        const file = mockLibraryFiles.find(
          (f) => f.id === fileId && f.projectId === projectId
        )
        if (!file) throw new Error('File not found')
        const versions = mockFileVersions[fileId] ?? []
        return {
          file,
          versions,
          linkedDecisions: file.linkedDecisions ?? [],
        }
      }
      if (!fileId) throw new Error('File ID required')
      return filesApi.fetchFileDetail(projectId, fileId)
    },
    enabled: !!projectId && !!fileId,
  })
}

export function useUploadFiles(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (files: File[]) => {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 1500))
        return {
          files: files.map((f, i) => ({
            id: `file-new-${Date.now()}-${i}`,
            name: f.name,
            type: 'drawing' as const,
            size: f.size,
            mimeType: f.type,
            currentVersionId: `ver-new-${i}`,
            uploadedBy: 'user-1',
            uploadedByName: 'Alex Morgan',
            uploadedAt: new Date().toISOString(),
            projectId,
            isDeleted: false,
            previewUrl: null,
            cdnUrl: URL.createObjectURL(f),
            version: 1,
            linkedDecisionsCount: 0,
            linkedDecisions: [],
          })) as LibraryFile[],
        }
      }
      const formData = new FormData()
      files.forEach((f) => formData.append('files', f))
      return filesApi.uploadFiles(projectId, formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files-library', projectId] })
      toast.success('Files uploaded successfully')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    },
  })
}

export function useRevertVersion(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      fileId,
      versionId,
    }: {
      fileId: string
      versionId: string
    }) => {
      if (USE_MOCK) {
        return Promise.resolve({} as LibraryFile)
      }
      return filesApi.revertToVersion(projectId, fileId, versionId)
    },
    onSuccess: (_, { fileId }) => {
      queryClient.invalidateQueries({ queryKey: ['files-library', projectId] })
      queryClient.invalidateQueries({
        queryKey: ['files-library', 'detail', projectId, fileId],
      })
      toast.success('Reverted to previous version')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Revert failed')
    },
  })
}

export function useLinkFileToDecision(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      fileId,
      decisionId,
      attachmentType,
      optionId,
    }: {
      fileId: string
      decisionId: string
      attachmentType?: 'primary' | 'reference'
      optionId?: string
    }) => {
      if (USE_MOCK) {
        return Promise.resolve({
          id: `att-${Date.now()}`,
          decisionId,
          fileId,
          attachedAt: new Date().toISOString(),
          attachmentType: attachmentType ?? 'primary',
        } as Awaited<ReturnType<typeof filesApi.linkFileToDecision>>)
      }
      return filesApi.linkFileToDecision(projectId, fileId, {
        decisionId,
        attachmentType,
        optionId,
      })
    },
    onSuccess: (_, { fileId }) => {
      queryClient.invalidateQueries({ queryKey: ['files-library', projectId] })
      queryClient.invalidateQueries({
        queryKey: ['files-library', 'detail', projectId, fileId],
      })
      toast.success('File linked to decision')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Link failed')
    },
  })
}

export function useProjectDecisions(projectId: string) {
  return useQuery({
    queryKey: ['files-library', 'decisions', projectId],
    queryFn: async () => {
      if (USE_MOCK) {
        const { mockDecisions } = await import('@/lib/workspace-mock')
        return mockDecisions.filter((d) => d.project_id === projectId)
      }
      return filesApi.fetchProjectDecisions(projectId)
    },
    enabled: !!projectId,
  })
}

export function validateFile(file: File): string | null {
  const allowed = [...ALLOWED_MIME_TYPES, 'application/octet-stream']
  const mimeOk =
    allowed.includes(file.type as (typeof allowed)[number]) ||
    file.name.match(/\.(pdf|jpg|jpeg|png|gif|webp|svg|dwg|rvt|zip)$/i)
  if (!mimeOk) {
    return `File type not allowed: ${file.name}`
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File too large: ${file.name} (max ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB)`
  }
  return null
}

export function validateVersionNotes(notes: string): string | null {
  if (notes.length < VERSION_NOTES_MIN) {
    return `Notes must be at least ${VERSION_NOTES_MIN} characters`
  }
  if (notes.length > VERSION_NOTES_MAX) {
    return `Notes must be at most ${VERSION_NOTES_MAX} characters`
  }
  return null
}

export function useUploadProgress() {
  const [progress, setProgress] = useState<UploadProgress[]>([])
  const updateProgress = useCallback(
    (fileId: string, updates: Partial<UploadProgress>) => {
      setProgress((prev) =>
        prev.map((p) =>
          p.fileId === fileId ? { ...p, ...updates } : p
        )
      )
    },
    []
  )
  const setProgressList = useCallback((list: UploadProgress[]) => {
    setProgress(list)
  }, [])
  const clearProgress = useCallback(() => setProgress([]), [])
  return { progress, updateProgress, setProgressList, clearProgress }
}
