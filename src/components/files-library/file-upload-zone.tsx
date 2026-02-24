import { useCallback, useRef, useState } from 'react'
import { Upload, CheckCircle, AlertCircle, X, RotateCcw } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { validateFile } from '@/hooks/use-files-library'
import type { UploadProgress } from '@/types/files-library'

export interface FileUploadZoneProps {
  onUpload: (files: File[]) => void
  isUploading?: boolean
  progress?: UploadProgress[]
  storageUsedPercent?: number
  onCancel?: () => void
  onRetry?: (fileId: string) => void
  className?: string
}

export function FileUploadZone({
  onUpload,
  isUploading = false,
  progress = [],
  storageUsedPercent = 0,
  onCancel,
  onRetry,
  className,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const validateAndUpload = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList)
      const errors: string[] = []
      const validFiles: File[] = []
      files.forEach((file) => {
        const err = validateFile(file)
        if (err) errors.push(err)
        else validFiles.push(file)
      })
      setValidationErrors(errors)
      if (validFiles.length) onUpload(validFiles)
    },
    [onUpload]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const related = e.relatedTarget as Node | null
    if (!related || !e.currentTarget.contains(related)) setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      if (e.dataTransfer.files.length) {
        validateAndUpload(e.dataTransfer.files)
      }
    },
    [validateAndUpload]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.files
      if (items?.length) validateAndUpload(items)
    },
    [validateAndUpload]
  )

  const handleClick = useCallback(() => {
    if (!isUploading) inputRef.current?.click()
  }, [isUploading])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files?.length) validateAndUpload(files)
      e.target.value = ''
    },
    [validateAndUpload]
  )

  const hasProgress = progress.length > 0
  const hasErrors = validationErrors.length > 0

  return (
    <div
      className={cn('space-y-4', className)}
      onPaste={handlePaste}
      role="region"
      aria-label="File upload zone"
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        tabIndex={0}
        role="button"
        aria-label="Drop files here or click to browse"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
        className={cn(
          'relative flex min-h-[180px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          isDragging && 'border-primary bg-primary/5 scale-[1.01]',
          !isDragging && 'border-border hover:border-primary/50 hover:bg-secondary/30',
          isUploading && 'pointer-events-none opacity-90'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.svg,.dwg,.rvt,.zip,application/pdf,image/*,application/vnd.dwg,application/zip"
          onChange={handleInputChange}
          className="sr-only"
          aria-hidden
        />
        <Upload
          className={cn(
            'h-12 w-12 transition-colors',
            isDragging ? 'text-primary' : 'text-muted-foreground'
          )}
          aria-hidden
        />
        <p className="mt-3 text-base font-medium text-foreground">
          Drag and drop files here
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          or click to browse. Supports PDF, images, BIM files (max 100 MB each).
        </p>
        {storageUsedPercent >= 80 && (
          <p className="mt-2 text-sm text-warning-muted">
            Storage at {storageUsedPercent}% — uploads may be limited.
          </p>
        )}
      </div>

      {hasErrors && (
        <div
          className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
          role="alert"
        >
          {validationErrors.map((msg, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{msg}</span>
            </div>
          ))}
        </div>
      )}

      {hasProgress && (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Upload progress</p>
            {isUploading && onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="text-muted-foreground hover:text-destructive"
                aria-label="Cancel upload"
              >
                <X className="mr-1 h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
          {progress.map((p) => (
            <div key={p.fileId} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-muted-foreground">
                  {p.fileName}
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  {p.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-success" aria-hidden />
                  )}
                  {p.status === 'error' && (
                    <>
                      <span className="text-destructive text-xs">{p.error}</span>
                      {onRetry && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onRetry(p.fileId)}
                          aria-label={`Retry ${p.fileName}`}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}
                  {(p.status === 'uploading' || p.status === 'pending') && (
                    <span className="text-muted-foreground tabular-nums">
                      {p.progress}%
                    </span>
                  )}
                </div>
              </div>
              {(p.status === 'uploading' || p.status === 'pending') && (
                <Progress value={p.progress} className="h-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
