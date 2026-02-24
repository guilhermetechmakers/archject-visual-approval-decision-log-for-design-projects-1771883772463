/**
 * AvatarUploader - Drag-and-drop or click-to-upload avatar with preview, progress, error states.
 * Size limit: 2–5 MB. Allowed formats: jpeg, png, webp.
 * Follows Archject design system: glassy, calm aesthetics with soft shadows.
 */

import { useState, useCallback } from 'react'
import { Upload, Loader2, User, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export interface AvatarUploaderProps {
  /** Current avatar URL (for display) */
  value?: string | null
  /** Callback when a valid file is selected (caller handles upload) */
  onFileSelect?: (file: File) => void
  /** Callback when upload completes with new URL */
  onUploadComplete?: (url: string) => void
  /** Callback when upload fails */
  onUploadError?: (error: string) => void
  /** Whether an upload is in progress */
  isUploading?: boolean
  /** Upload progress 0-100 */
  progress?: number
  /** Error message to display */
  error?: string | null
  /** Disabled state */
  disabled?: boolean
  /** Size of avatar (default: 24 = 96px) */
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
}

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Use JPEG, PNG, or WebP format'
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `File must be under ${MAX_SIZE_BYTES / (1024 * 1024)} MB`
  }
  return null
}

export function AvatarUploader({
  value,
  onFileSelect,
  isUploading = false,
  progress = 0,
  error,
  disabled = false,
  size = 'md',
  className,
}: AvatarUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const displayUrl = previewUrl || value ?? undefined
  const displayError = error ?? localError

  const handleFile = useCallback(
    (file: File) => {
      if (disabled || isUploading) return
      const err = validateFile(file)
      if (err) {
        setLocalError(err)
        setPreviewUrl(null)
        return
      }
      setLocalError(null)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      onFileSelect?.(file)
    },
    [disabled, isUploading, onFileSelect]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled && !isUploading) setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const clearPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setLocalError(null)
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-secondary/50 transition-all duration-200',
            sizeClasses[size],
            isDragging && 'border-primary bg-primary/5',
            disabled && 'cursor-not-allowed opacity-60',
            !disabled && !isUploading && 'hover:border-primary/30 hover:bg-secondary/70'
          )}
        >
          <input
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
            aria-label="Upload avatar"
          />
          {displayUrl ? (
            <div className="relative">
              <Avatar className={cn('ring-2 ring-border', sizeClasses[size])}>
                <AvatarImage src={displayUrl} alt="Avatar preview" />
                <AvatarFallback>
                  <User className="h-1/2 w-1/2" />
                </AvatarFallback>
              </Avatar>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/80">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <Upload className="h-8 w-8" />
              )}
              <span className="text-xs font-medium">
                {isUploading ? 'Uploading...' : 'Drag & drop or click'}
              </span>
              <span className="text-[10px]">JPEG, PNG, WebP up to 5 MB</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {previewUrl && !isUploading && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={clearPreview}
              disabled={disabled}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel selection
            </Button>
          )}
          {displayError && (
            <p className="text-sm text-destructive" role="alert">
              {displayError}
            </p>
          )}
        </div>
      </div>
      {isUploading && progress > 0 && (
        <Progress value={progress} className="h-2" />
      )}
    </div>
  )
}
