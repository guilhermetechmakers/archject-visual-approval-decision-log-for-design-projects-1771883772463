import { Link } from 'react-router-dom'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface TermsCheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  error?: string
  disabled?: boolean
  className?: string
}

export function TermsCheckbox({
  checked,
  onCheckedChange,
  error,
  disabled,
  className,
}: TermsCheckboxProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-start gap-3">
        <Checkbox
          id="terms"
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(v === true)}
          disabled={disabled}
          aria-describedby={error ? 'terms-error' : undefined}
          aria-invalid={!!error}
        />
        <Label
          htmlFor="terms"
          className="text-sm font-normal leading-relaxed cursor-pointer"
        >
          I agree to the{' '}
          <Link
            to="/terms"
            className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            to="/privacy"
            className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            Privacy Policy
          </Link>
        </Label>
      </div>
      {error && (
        <p id="terms-error" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
