import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface ConsentToggleProps {
  id: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  label: string
  ariaLabel?: string
  className?: string
}

/**
 * Accessible switch control for cookie consent.
 * Uses role="switch", aria-checked, and keyboard support via Radix Switch.
 */
export function ConsentToggle({
  id,
  checked,
  onCheckedChange,
  disabled = false,
  label,
  ariaLabel,
  className,
}: ConsentToggleProps) {
  return (
    <div
      className={cn('flex items-center justify-between gap-4', className)}
      role="group"
      aria-label={ariaLabel ?? label}
    >
      <Label
        htmlFor={id}
        className={cn(
          'text-sm font-medium cursor-pointer select-none',
          disabled && 'cursor-not-allowed opacity-70'
        )}
      >
        {label}
      </Label>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel ?? `${label}, ${checked ? 'enabled' : 'disabled'}`}
        className={cn(
          'transition-transform duration-200',
          !disabled && 'hover:scale-[1.02] active:scale-[0.98]'
        )}
      />
    </div>
  )
}
