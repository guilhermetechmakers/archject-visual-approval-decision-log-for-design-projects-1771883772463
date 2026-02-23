import { Shield, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SecurityHintsPanelProps {
  className?: string
}

export function SecurityHintsPanel({ className }: SecurityHintsPanelProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-muted/30 p-4 space-y-3 text-sm transition-all duration-200 hover:border-border/80',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-primary shrink-0" />
        <span className="font-medium text-foreground">Secure your account</span>
      </div>
      <p className="text-muted-foreground">
        Enable two-factor authentication for an extra layer of security. Available
        in account settings after signup.
      </p>
      <div className="flex items-center gap-2 pt-1">
        <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-muted-foreground">
          Enterprise SSO: Contact your admin or use the Team plan for SSO
          integration.
        </span>
      </div>
    </div>
  )
}
