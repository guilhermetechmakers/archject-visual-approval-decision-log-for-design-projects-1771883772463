import { useCallback, useRef, useState } from 'react'
import { Plus, FileImage, Upload, X, GripVertical } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useDecisionEditor } from '@/contexts/decision-editor-context'
import type { DecisionOptionForm, MediaReference } from '@/types/decision-editor'

function generateId(): string {
  return `opt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function generateMediaId(): string {
  return `med-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export interface DecisionEditorOptionsUploaderProps {
  onNext?: () => void
}

export function DecisionEditorOptionsUploader({ onNext }: DecisionEditorOptionsUploaderProps) {
  const {
    options,
    addOption,
    addOptionWithFiles,
    updateOption,
    removeOption,
    setStep,
  } = useDecisionEditor()

  const [dragOver, setDragOver] = useState<string | null>(null)

  const handleAddOption = useCallback(() => {
    addOption({
      id: generateId(),
      title: `Option ${options.length + 1}`,
      description: '',
      order: options.length,
      mediaFiles: [],
      caption: '',
      cost: '',
      version: 1,
      notes: '',
    })
  }, [addOption, options.length])

  const handleFileSelect = useCallback(
    (optionId: string, files: FileList | null) => {
      if (!files?.length) return
      const option = options.find((o) => o.id === optionId)
      if (!option) return

      const newMedia: MediaReference[] = Array.from(files).map((file) => ({
        id: generateMediaId(),
        fileName: file.name,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/')
          ? 'image'
          : file.type === 'application/pdf'
            ? 'pdf'
            : 'bim',
        size: file.size,
        version: 1,
        uploadedAt: new Date().toISOString(),
        isPrimary: option.mediaFiles.length === 0,
      }))

      updateOption(optionId, {
        mediaFiles: [...option.mediaFiles, ...newMedia],
        version: option.version + 1,
      })
    },
    [options, updateOption]
  )

  const handleRemoveMedia = useCallback(
    (optionId: string, mediaId: string) => {
      const option = options.find((o) => o.id === optionId)
      if (!option) return
      const filtered = option.mediaFiles.filter((m) => m.id !== mediaId)
      const hadPrimary = option.mediaFiles.some((m) => m.id === mediaId && m.isPrimary)
      if (hadPrimary && filtered.length > 0) {
        filtered[0].isPrimary = true
      }
      updateOption(optionId, {
        mediaFiles: filtered,
        version: option.version + 1,
      })
    },
    [options, updateOption]
  )

  const handleSetPrimary = useCallback(
    (optionId: string, mediaId: string) => {
      const option = options.find((o) => o.id === optionId)
      if (!option) return
      const updated = option.mediaFiles.map((m) => ({
        ...m,
        isPrimary: m.id === mediaId,
      }))
      updateOption(optionId, { mediaFiles: updated })
    },
    [options, updateOption]
  )

  const handleNext = () => {
    if (onNext) {
      onNext()
    } else {
      setStep('comparison')
    }
  }

  return (
    <Card className="rounded-xl border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle>Options upload</CardTitle>
        <p className="text-sm text-muted-foreground">
          Add options with media (images, specs, layouts, BIM files), captions, and costs.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddOption}
            className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add option
          </Button>
        </div>

        {options.length === 0 ? (
          <div
            className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 p-8 text-center"
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver('new')
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(null)
              if (e.dataTransfer.files?.length && options.length === 0) {
                addOptionWithFiles(e.dataTransfer.files)
              } else {
                handleAddOption()
              }
            }}
          >
            <Upload className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 font-medium">No options yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add options and upload media for comparison
            </p>
            <Button
              type="button"
              className="mt-4"
              onClick={handleAddOption}
            >
              Add first option
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {options.map((option) => (
              <OptionCard
                key={option.id}
                option={option}
                onUpdate={(data) => updateOption(option.id, data)}
                onRemove={() => removeOption(option.id)}
                onFileSelect={(files) => handleFileSelect(option.id, files)}
                onRemoveMedia={(mediaId) => handleRemoveMedia(option.id, mediaId)}
                onSetPrimary={(mediaId) => handleSetPrimary(option.id, mediaId)}
                onDragOver={() => setDragOver(option.id)}
                onDragLeave={() => setDragOver(null)}
                isDragOver={dragOver === option.id}
              />
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleNext}
            disabled={options.length === 0}
            className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Next: Side-by-Side Builder
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface OptionCardProps {
  option: DecisionOptionForm
  index?: number
  onUpdate: (data: Partial<DecisionOptionForm>) => void
  onRemove: () => void
  onFileSelect: (files: FileList) => void
  onRemoveMedia: (mediaId: string) => void
  onSetPrimary: (mediaId: string) => void
  onDragOver: () => void
  onDragLeave: () => void
  isDragOver: boolean
}

function OptionCard({
  option,
  onUpdate,
  onRemove,
  onFileSelect,
  onRemoveMedia,
  onSetPrimary,
  onDragOver,
  onDragLeave,
  isDragOver,
}: OptionCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-6 transition-all duration-200',
        isDragOver && 'border-primary bg-primary/5'
      )}
      onDragOver={(e) => {
        e.preventDefault()
        onDragOver()
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault()
        onDragLeave()
        onFileSelect(e.dataTransfer.files)
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1">
          <div className="flex shrink-0 items-center text-muted-foreground">
            <GripVertical className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={option.title}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                  placeholder="Option title"
                />
              </div>
              <div className="space-y-2">
                <Label>Cost</Label>
                <Input
                  value={option.cost || ''}
                  onChange={(e) => onUpdate({ cost: e.target.value })}
                  placeholder="e.g. $1,200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Caption</Label>
              <Input
                value={option.caption || ''}
                onChange={(e) => onUpdate({ caption: e.target.value })}
                placeholder="Brief caption"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={option.notes || ''}
                onChange={(e) => onUpdate({ notes: e.target.value })}
                placeholder="Internal notes"
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Media</Label>
                <Badge variant="secondary" className="text-xs">
                  v{option.version}
                </Badge>
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,application/pdf,.dwg,.rvt,.ifc"
                  className="hidden"
                  onChange={(e) => onFileSelect(e.target.files!)}
                />
                <div className="flex flex-wrap gap-2">
                  {option.mediaFiles.map((media) => (
                    <div
                      key={media.id}
                      className="group relative aspect-video w-24 overflow-hidden rounded-lg border border-border bg-secondary"
                    >
                      {media.type === 'image' ? (
                        <img
                          src={media.url}
                          alt={media.fileName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <FileImage className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      {media.isPrimary && (
                        <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                          Primary
                        </span>
                      )}
                      <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {!media.isPrimary && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon-sm"
                            className="h-6 w-6"
                            onClick={() => onSetPrimary(media.id)}
                          >
                            Set primary
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-sm"
                          className="h-6 w-6"
                          onClick={() => onRemoveMedia(media.id)}
                          aria-label="Remove"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click?.()}
                    className="flex aspect-video w-24 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/50 text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                  >
                    <Upload className="h-6 w-6" />
                    <span className="mt-1 text-xs">Upload</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="shrink-0 text-muted-foreground hover:text-destructive"
          aria-label="Remove option"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
