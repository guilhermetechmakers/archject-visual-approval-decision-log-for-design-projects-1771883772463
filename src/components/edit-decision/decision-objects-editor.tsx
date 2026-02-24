import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DecisionObjectCard } from './decision-object-card'
import { cn } from '@/lib/utils'
import type { DecisionObject } from '@/types/edit-decision'

export interface DecisionObjectsEditorProps {
  decisionId: string
  objects: DecisionObject[]
  onChange: (objects: DecisionObject[]) => void
  className?: string
}

export function DecisionObjectsEditor({
  decisionId,
  objects,
  onChange,
  className,
}: DecisionObjectsEditorProps) {
  const addObject = () => {
    const newObject: DecisionObject = {
      id: `obj-${crypto.randomUUID()}`,
      decision_id: decisionId,
      title: 'New Decision Object',
      description: null,
      order_index: objects.length,
      status: 'draft',
      metadata: {},
      options: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    onChange([...objects, newObject])
  }

  const updateObject = (index: number, data: Partial<DecisionObject>) => {
    const next = [...objects]
    next[index] = { ...next[index], ...data }
    onChange(next)
  }

  const reorderObject = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= objects.length) return
    const next = [...objects]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(
      next.map((o, i) => ({ ...o, order_index: i }))
    )
  }

  const duplicateObject = (index: number) => {
    const src = objects[index]
    const baseId = crypto.randomUUID()
    const copy: DecisionObject = {
      ...src,
      id: `obj-${baseId}`,
      order_index: objects.length,
      options: src.options.map((o, i) => ({
        ...o,
        id: `opt-${baseId}-${i}`,
        order_index: i,
      })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    onChange([...objects, copy])
  }

  const deleteObject = (index: number) => {
    onChange(objects.filter((_, i) => i !== index))
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Decision Objects
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={addObject}
          className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add object
        </Button>
      </div>

      <div className="space-y-4">
        {objects.map((obj, index) => (
          <DecisionObjectCard
            key={obj.id}
            object={obj}
            index={index}
            totalCount={objects.length}
            onUpdate={(data) => updateObject(index, data)}
            onMoveUp={() => reorderObject(index, 'up')}
            onMoveDown={() => reorderObject(index, 'down')}
            onDuplicate={() => duplicateObject(index)}
            onDelete={() => deleteObject(index)}
          />
        ))}
      </div>

      {objects.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-secondary/20 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No decision objects yet. Add one to define options and metadata.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={addObject}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add first object
          </Button>
        </div>
      )}
    </div>
  )
}
