/**
 * Group-by multi-select controls (Project, Client, Template)
 */

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { GroupByOption } from '@/types/analytics'

const OPTIONS: { value: GroupByOption; label: string }[] = [
  { value: 'PROJECT', label: 'Project' },
  { value: 'CLIENT', label: 'Client' },
  { value: 'TEMPLATE', label: 'Template' },
]

interface GroupByControlsProps {
  selected: GroupByOption[]
  onChange: (selected: GroupByOption[]) => void
  className?: string
}

export function GroupByControls({
  selected,
  onChange,
  className,
}: GroupByControlsProps) {
  const toggle = (opt: GroupByOption) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt))
    } else {
      onChange([...selected, opt])
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      <Label className="text-sm font-medium">Group by</Label>
      <div className="flex flex-wrap gap-4">
        {OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Checkbox
              checked={selected.includes(opt.value)}
              onCheckedChange={() => toggle(opt.value)}
              aria-label={`Group by ${opt.label}`}
            />
            <span className="text-sm">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
