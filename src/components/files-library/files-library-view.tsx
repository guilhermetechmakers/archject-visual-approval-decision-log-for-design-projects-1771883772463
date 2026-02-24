import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  FileUploadZone,
  FileCardGrid,
  FiltersBar,
  PreviewModal,
  FileDetailModal,
  DecisionAttachmentModal,
  ProjectWorkspaceLink,
} from '@/components/files-library'
import { Button } from '@/components/ui/button'
import {
  useFilesLibrary,
  useUploadFiles,
  useUploadProgress,
  useFileDetail,
  useRevertVersion,
  useLinkFileToDecision,
  useProjectDecisions,
  useDeleteFile,
  useExportFileBundle,
} from '@/hooks/use-files-library'
import { useProjectWorkspace } from '@/hooks/use-workspace'
import { computeFileHash } from '@/lib/file-hash'
import type { LibraryFile, FileFilters, FileVersion } from '@/types/files-library'

export interface FilesLibraryViewProps {
  storageUsedPercent?: number
  onUpload?: (files: File[]) => void
  showWorkspaceLink?: boolean
  showFullLibraryLink?: boolean
  className?: string
}

export function FilesLibraryView({
  storageUsedPercent = 0,
  onUpload: onUploadProp,
  showWorkspaceLink = true,
  showFullLibraryLink = false,
  className,
}: FilesLibraryViewProps) {
  const { projectId } = useParams<{ projectId: string }>()
  const [filters, setFilters] = useState<FileFilters>({})
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [detailFile, setDetailFile] = useState<LibraryFile | null>(null)
  const [previewFile, setPreviewFile] = useState<LibraryFile | null>(null)
  const [attachFile, setAttachFile] = useState<LibraryFile | null>(null)

  const { project } = useProjectWorkspace(projectId ?? '')
  const { data, isLoading } = useFilesLibrary(projectId ?? '', filters)
  const uploadMutation = useUploadFiles(projectId ?? '')
  const { progress, setProgressList, clearProgress } = useUploadProgress()
  const { data: detailData } = useFileDetail(
    projectId ?? '',
    detailFile?.id ?? null
  )
  const revertMutation = useRevertVersion(projectId ?? '')
  const linkMutation = useLinkFileToDecision(projectId ?? '')
  const deleteMutation = useDeleteFile(projectId ?? '')
  const exportMutation = useExportFileBundle(projectId ?? '')
  const { data: decisions = [] } = useProjectDecisions(projectId ?? '')

  const files = data?.files ?? []
  const storagePercent =
    storageUsedPercent ||
    (project
      ? Math.round(
          (project.current_storage_bytes / project.storage_quota_bytes) * 100
        )
      : 0)

  const handleUpload = useCallback(
    async (fileList: File[]) => {
      if (onUploadProp) {
        onUploadProp(fileList)
        return
      }
      clearProgress()
      const hashes: Record<string, string> = {}
      try {
        for (let i = 0; i < fileList.length; i++) {
          hashes[fileList[i].name] = await computeFileHash(fileList[i])
        }
      } catch {
        // Hash optional; continue without
      }
      uploadMutation.mutate(
        {
          files: fileList,
          onProgress: setProgressList,
          hash: Object.keys(hashes).length ? hashes : undefined,
        },
        {
          onSettled: () => {
            setTimeout(clearProgress, 2000)
          },
        }
      )
    },
    [onUploadProp, uploadMutation, setProgressList, clearProgress]
  )

  const handleDetail = useCallback((file: LibraryFile) => {
    setDetailFile(file)
  }, [])

  const handleRevert = useCallback(
    (version: FileVersion) => {
      if (detailFile)
        revertMutation.mutate(
          { fileId: detailFile.id, versionId: version.id },
          {
            onSuccess: () => setDetailFile(null),
          }
        )
    },
    [detailFile, revertMutation]
  )

  const handleAttachToDecision = useCallback((file: LibraryFile) => {
    setAttachFile(file)
  }, [])

  const handleLinkAttach = useCallback(
    (decisionId: string) => {
      if (attachFile) {
        linkMutation.mutate(
          { fileId: attachFile.id, decisionId },
          { onSuccess: () => setAttachFile(null) }
        )
      }
    },
    [attachFile, linkMutation]
  )

  const handleNavigateToDecision = useCallback(
    (decisionId: string) => {
      if (projectId) {
        window.location.href = `/dashboard/projects/${projectId}/decisions/${decisionId}/internal`
      }
    },
    [projectId]
  )

  const handleDeleteFile = useCallback(
    (file: LibraryFile) => {
      deleteMutation.mutate(file.id)
    },
    [deleteMutation]
  )

  const handleExportFile = useCallback(
    (file: LibraryFile) => {
      exportMutation.mutate(file.id)
    },
    [exportMutation]
  )

  if (!projectId) return null

  return (
    <div className={className}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Files & Drawings Library</h2>
        <div className="flex items-center gap-2">
          {showFullLibraryLink && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/dashboard/projects/${projectId}/files`}>
                Open full library
              </Link>
            </Button>
          )}
          {showWorkspaceLink && (
            <ProjectWorkspaceLink projectId={projectId} />
          )}
        </div>
      </div>

      <div className="space-y-6">
        <FileUploadZone
          onUpload={handleUpload}
          isUploading={uploadMutation.isPending}
          progress={progress}
          storageUsedPercent={storagePercent}
        />

        <FiltersBar filters={filters} onFiltersChange={setFilters} />

        <FileCardGrid
          files={files}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onPreview={(f) => handleDetail(f)}
          onDownload={(f) => {
            if (f.cdnUrl) window.open(f.cdnUrl, '_blank')
          }}
          onLinkToDecision={handleAttachToDecision}
          onNavigateToDecision={handleNavigateToDecision}
          onDelete={handleDeleteFile}
          onExport={handleExportFile}
          canDelete
          isLoading={isLoading}
        />
      </div>

      <FileDetailModal
        file={detailFile}
        versions={detailData?.versions ?? []}
        open={!!detailFile}
        onOpenChange={(open) => !open && setDetailFile(null)}
        onDownload={(f) => f.cdnUrl && window.open(f.cdnUrl, '_blank')}
        onRevertVersion={handleRevert}
        onAttachToDecision={handleAttachToDecision}
        onNavigateToDecision={handleNavigateToDecision}
        isReverting={revertMutation.isPending}
        onOpenPreview={(f) => setPreviewFile(f)}
      />

      <PreviewModal
        file={previewFile}
        files={files}
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
        onDownload={(f) => f.cdnUrl && window.open(f.cdnUrl, '_blank')}
      />

      <DecisionAttachmentModal
        file={attachFile}
        decisions={decisions}
        open={!!attachFile}
        onOpenChange={(open) => !open && setAttachFile(null)}
        onAttach={handleLinkAttach}
        isAttaching={linkMutation.isPending}
      />
    </div>
  )
}
