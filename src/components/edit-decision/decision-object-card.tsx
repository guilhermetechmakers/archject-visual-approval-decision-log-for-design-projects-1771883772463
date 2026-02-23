import { useState } from 'react'
import {
  GripVertical,
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { OptionsEditor } from './options-editor'
import { cn } from '@/lib/utils'
import type { DecisionObject, DecisionOption } from '@/types/edit-decision'
import type { DecisionStatus } from '@/types/workspace'

const STATUS_OPTIONS: { value: DecisionStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

const STATUS_VARIANT: Record<DecisionStatus, 'default' | 'success' | 'warning' | 'destructive'> = {
  draft: 'default',
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
}

export interface DecisionObjectCardProps {
  object: DecisionObject
  index: number
  totalCount: number
  onUpdate: (updates: Partial<DecisionObject>) => void
  onDuplicate: () => void
  onDelete: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  isDragging?: boolean
  disabled?: boolean
  className?: string
}

export function DecisionObjectCard({
  object,
  index,
  totalCount,
  onUpdate,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging = false,
  disabled = false,
  className,
}: DecisionObjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleOptionsChange = (options: DecisionOption[]) => {
    onUpdate({ options })
  }

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        isDragging && 'opacity-50',
        className
      )}
      draggable={!disabled && !!onDragStart}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={() => {}}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {!disabled && onDragStart && (
            <span
              className="cursor-grab text-muted-foreground"
              aria-hidden
            >
              <GripVertical className="h-4 w-4" />
            </span>
          )}
          <div className="min-w-0 flex-1 space-y-2">
            <Input
              value={object.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Decision object title"
              disabled={disabled}
              className="font-semibold"
            />
            <Input
              value={object.description ?? ''}
              onChange={(e) =>
                onUpdate({ description: e.target.value || null })
              }
              placeholder="Description (optional)"
              disabled={disabled}
              className="text-sm text-muted-foreground"
            />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Select
            value={object.status}
            onValueChange={(v) => onUpdate({ status: v as DecisionStatus })}
            disabled={disabled}
          >
            <SelectTrigger className="w-[120px] h-8" aria-label="Status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant={STATUS_VARIANT[object.status]}>
            {object.status}
          </Badge>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          {!disabled && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Object menu"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onUpdate({})}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} destructive>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4 pt-0">
          <div className="flex gap-2">
            {onMoveUp && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onMoveUp}
                disabled={index === 0}
                aria-label="Move up"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            )}
            {onMoveDown && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onMoveDown}
                disabled={index >= totalCount - 1}
                aria-label="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
          </div>
          <OptionsEditor
            options={object.options}
            decisionObjectId={object.id}
            onOptionsChange={handleOptionsChange}
            disabled={disabled}
          />
        </CardContent>
      )}
    </Card>
  )
}
