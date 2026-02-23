import { useState } from 'react'
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Pencil,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { DecisionOption } from '@/types/edit-decision'

export interface OptionsEditorProps {
  options: DecisionOption[]
  decisionObjectId: string
  onChange?: (options: DecisionOption[]) => void
  onOptionsChange?: (options: DecisionOption[]) => void
  disabled?: boolean
  className?: string
}

export function OptionsEditor({
  options,
  decisionObjectId,
  onChange,
  onOptionsChange,
  disabled = false,
  className,
}: OptionsEditorProps) {
  const handleChange = onChange ?? onOptionsChange ?? (() => {})
  const [editingOption, setEditingOption] = useState<DecisionOption | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const moveOption = (index: number, direction: 'up' | 'down') => {
    const newOptions = [...options]
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= newOptions.length) return
    ;[newOptions[index], newOptions[target]] = [newOptions[target], newOptions[index]]
    newOptions.forEach((o, i) => ({ ...o, order_index: i }))
    handleChange(
      newOptions.map((o, i) => ({ ...o, order_index: i }))
    )
  }

  const removeOption = (id: string) => {
    handleChange(options.filter((o) => o.id !== id))
  }

  const addOption = (data: { label: string; media_url?: string; cost?: number }) => {
    const newOption: DecisionOption = {
      id: `opt-${Date.now()}`,
      decision_object_id: decisionObjectId,
      label: data.label,
      media_url: data.media_url ?? null,
      cost: data.cost ?? null,
      order_index: options.length,
    }
    handleChange([...options, newOption])
    setIsAddOpen(false)
  }

  const updateOption = (id: string, data: Partial<DecisionOption>) => {
    handleChange(
      options.map((o) => (o.id === id ? { ...o, ...data } : o))
    )
    setEditingOption(null)
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Options</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddOpen(true)}
          disabled={disabled}
          className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add option
        </Button>
      </div>

      <ul className="space-y-2" role="list">
        {options.map((opt, index) => (
          <li
            key={opt.id}
            className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 p-3 transition-all duration-200 hover:bg-secondary/50"
          >
            <div
              className="cursor-grab touch-none text-muted-foreground"
              aria-hidden
            >
              <GripVertical className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground truncate">{opt.label}</p>
              {opt.cost != null && (
                <p className="text-xs text-muted-foreground">${opt.cost}</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => moveOption(index, 'up')}
                disabled={disabled || index === 0}
                aria-label="Move up"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => moveOption(index, 'down')}
                disabled={disabled || index === options.length - 1}
                aria-label="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setEditingOption(opt)}
                disabled={disabled}
                aria-label="Edit option"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                onClick={() => removeOption(opt.id)}
                disabled={disabled}
                aria-label="Remove option"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {options.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          No options defined. Add an option to get started.
        </div>
      )}

      <OptionEditDialog
        option={editingOption}
        open={!!editingOption}
        onOpenChange={(open) => !open && setEditingOption(null)}
        onSave={(data) =>
          editingOption && updateOption(editingOption.id, data)
        }
      />

      <OptionAddDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onAdd={addOption}
      />
    </div>
  )
}

function OptionEditDialog({
  option,
  open,
  onOpenChange,
  onSave,
}: {
  option: DecisionOption | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: Partial<DecisionOption>) => void
}) {
  const [label, setLabel] = useState(option?.label ?? '')
  const [mediaUrl, setMediaUrl] = useState(option?.media_url ?? '')
  const [cost, setCost] = useState(option?.cost ?? '')

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setLabel(option?.label ?? '')
      setMediaUrl(option?.media_url ?? '')
      setCost(String(option?.cost ?? ''))
    }
    onOpenChange(next)
  }

  const handleSave = () => {
    onSave({
      label: label.trim(),
      media_url: mediaUrl.trim() || null,
      cost: cost ? Number(cost) : null,
    })
    handleOpenChange(false)
  }

  if (!option) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit option</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-label">Label</Label>
            <Input
              id="edit-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Option label"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-media">Media URL</Label>
            <Input
              id="edit-media"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-cost">Cost</Label>
            <Input
              id="edit-cost"
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function OptionAddDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: { label: string; media_url?: string; cost?: number }) => void
}) {
  const [label, setLabel] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [cost, setCost] = useState('')

  const handleAdd = () => {
    if (!label.trim()) return
    onAdd({
      label: label.trim(),
      media_url: mediaUrl.trim() || undefined,
      cost: cost ? Number(cost) : undefined,
    })
    setLabel('')
    setMediaUrl('')
    setCost('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add option</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="add-label">Label *</Label>
            <Input
              id="add-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Option label"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-media">Media URL</Label>
            <Input
              id="add-media"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-cost">Cost</Label>
            <Input
              id="add-cost"
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!label.trim()}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
