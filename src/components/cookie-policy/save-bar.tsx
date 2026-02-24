import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SaveBarProps {
  onSave: () => void
  onAcceptAll?: () => void
  onReset: () => void
  isSaving?: boolean
  hasChanges?: boolean
  className?: string
}

/**
 * Action bar with Save Preferences, Accept All, and Reset to Defaults.
 */
export function SaveBar({
  onSave,
  onAcceptAll,
  onReset,
  isSaving = false,
  hasChanges = false,
  className,
}: SaveBarProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-card',
        className
      )}
    >
      <Button
        onClick={onSave}
        disabled={isSaving || !hasChanges}
        aria-busy={isSaving}
        aria-label="Save cookie preferences"
        className="min-w-[140px]"
      >
        {isSaving ? 'Saving…' : 'Save Preferences'}
      </Button>
      {onAcceptAll && (
        <Button
          variant="secondary"
          onClick={onAcceptAll}
          disabled={isSaving}
          aria-label="Accept all cookie categories"
        >
          Accept All
        </Button>
      )}
      <Button
        variant="outline"
        onClick={onReset}
        disabled={isSaving}
        aria-label="Reset to default cookie preferences"
      >
        Reset to Defaults
      </Button>
    </div>
  )
}
