/**
 * AssetUploader - Drag-and-drop logo/favicon upload with size validation
 * Supports SVG/PNG, progress indicators, responsive logo sizing
 */

import { useState, useCallback } from 'react'
import { Upload, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
const ACCEPT_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml']
const MIN_LOGO_WIDTH = 100
const MIN_LOGO_HEIGHT = 40

export interface AssetUploaderProps {
  assetType?: 'logo' | 'favicon'
  value?: string | null
  onChange?: (url: string, file?: File) => void
  onUpload?: (file: File) => Promise<string>
  disabled?: boolean
  className?: string
}

export function AssetUploader({
  assetType = 'logo',
  value,
  onChange,
  onUpload,
  disabled,
  className,
}: AssetUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPT_TYPES.includes(file.type)) {
      return 'Use PNG, JPG, or SVG'
    }
    if (file.size > MAX_SIZE_BYTES) {
      return 'File must be under 5MB'
    }
    return null
  }, [])

  const validateImageDimensions = useCallback(
    (url: string): Promise<string | null> =>
      new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          if (assetType === 'logo' && (img.width < MIN_LOGO_WIDTH || img.height < MIN_LOGO_HEIGHT)) {
            resolve(`Logo should be at least ${MIN_LOGO_WIDTH}×${MIN_LOGO_HEIGHT}px`)
          } else {
            resolve(null)
          }
        }
        img.onerror = () => resolve('Could not load image')
        img.src = url
      }),
    [assetType]
  )

  const handleFile = useCallback(
    async (file: File) => {
      setError(null)
      const err = validateFile(file)
      if (err) {
        setError(err)
        toast.error(err)
        return
      }
      const objectUrl = URL.createObjectURL(file)
      const dimErr = await validateImageDimensions(objectUrl)
      URL.revokeObjectURL(objectUrl)
      if (dimErr) {
        setError(dimErr)
        toast.error(dimErr)
        return
      }
      if (onUpload) {
        setIsUploading(true)
        try {
          const url = await onUpload(file)
          onChange?.(url, file)
          toast.success('Logo uploaded')
        } catch {
          toast.error('Upload failed')
          setError('Upload failed')
        } finally {
          setIsUploading(false)
        }
      } else {
        const url = URL.createObjectURL(file)
        onChange?.(url, file)
        toast.success('Logo selected')
      }
    },
    [validateFile, validateImageDimensions, onUpload, onChange]
  )

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const handleRemove = () => {
    onChange?.('', undefined)
    setError(null)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label>{assetType === 'logo' ? 'Logo' : 'Favicon'}</Label>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex min-h-[120px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-secondary/30 transition-all duration-200',
          isDragging && 'border-primary bg-primary/5',
          disabled && 'cursor-not-allowed opacity-60',
          error && 'border-destructive'
        )}
      >
        <input
          type="file"
          accept={ACCEPT_TYPES.join(',')}
          className="hidden"
          id={`asset-upload-${assetType}`}
          onChange={handleSelect}
          disabled={disabled || isUploading}
        />
        {value ? (
          <div className="relative flex flex-col items-center gap-2 p-4">
            <img
              src={value}
              alt="Logo preview"
              className="max-h-16 max-w-40 object-contain"
            />
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-8 w-8 rounded-full p-0 text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                aria-label="Remove logo"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <label
            htmlFor={`asset-upload-${assetType}`}
            className="flex cursor-pointer flex-col items-center gap-2 px-4 py-6"
          >
            {isUploading ? (
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            ) : (
              <Upload className="h-10 w-10 text-muted-foreground" />
            )}
            <span className="text-center text-sm text-muted-foreground">
              {isUploading
                ? 'Uploading...'
                : 'Drag & drop or click to upload'}
            </span>
            <span className="text-xs text-muted-foreground">
              PNG, JPG, or SVG · Max 5MB
            </span>
          </label>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
