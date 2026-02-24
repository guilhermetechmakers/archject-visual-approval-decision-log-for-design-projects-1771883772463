/**
 * AssetUploader - drag-and-drop logo/favicon upload with size validation and progress.
 * Supports SVG, PNG, JPG; max 5MB; responsive logo sizing hints.
 */

import { useState, useCallback } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
const MIN_DIMENSION = 64

export interface AssetUploaderProps {
  assetType?: 'logo' | 'favicon'
  value?: string | null
  onChange: (url: string, file?: File) => void
  onUpload?: (file: File) => Promise<{ url: string }>
  disabled?: boolean
  className?: string
}

export function AssetUploader({
  assetType = 'logo',
  value,
  onChange,
  onUpload,
  disabled = false,
  className,
}: AssetUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Use PNG, JPG or SVG only'
    }
    if (file.size > MAX_SIZE_BYTES) {
      return 'File must be under 5MB'
    }
    return null
  }, [])

  const handleFile = useCallback(
    async (file: File) => {
      setError(null)
      const err = validateFile(file)
      if (err) {
        setError(err)
        return
      }
      if (onUpload) {
        setIsUploading(true)
        try {
          const { url } = await onUpload(file)
          onChange(url, file)
        } catch {
          setError('Upload failed')
        } finally {
          setIsUploading(false)
        }
      } else {
        const url = URL.createObjectURL(file)
        onChange(url, file)
      }
    },
    [onUpload, onChange, validateFile]
  )

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleRemove = () => {
    onChange('')
    setError(null)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex min-h-[120px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-secondary/30 p-4 text-center transition-all duration-200',
          isDragging && !disabled && 'border-primary bg-primary/5',
          disabled && 'cursor-not-allowed opacity-60'
        )}
      >
        <input
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="hidden"
          id={`asset-upload-${assetType}`}
          onChange={handleSelect}
          disabled={disabled}
        />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Uploading…</span>
          </div>
        ) : value ? (
          <div className="relative flex flex-col items-center gap-2">
            <img
              src={value}
              alt={`${assetType} preview`}
              className="max-h-16 max-w-32 object-contain"
            />
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-destructive/20 text-destructive hover:bg-destructive/30"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                aria-label="Remove"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ) : (
          <label
            htmlFor={`asset-upload-${assetType}`}
            className="flex cursor-pointer flex-col items-center gap-2"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Drag & drop or click to upload
            </span>
            <span className="text-xs text-muted-foreground">
              PNG, JPG or SVG • max 5MB • min {MIN_DIMENSION}×{MIN_DIMENSION}px
            </span>
          </label>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
