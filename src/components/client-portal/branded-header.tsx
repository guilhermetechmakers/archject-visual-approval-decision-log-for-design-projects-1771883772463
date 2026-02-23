import { HelpCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { BrandingConfig } from '@/types/client-portal'

export interface BrandedHeaderProps {
  decisionTitle: string
  branding: BrandingConfig
  instructions?: string
  helpTip?: string
  className?: string
}

export function BrandedHeader({
  decisionTitle,
  branding,
  instructions = 'Please review the options below and select your preferred choice.',
  helpTip,
  className,
}: BrandedHeaderProps) {
  const accentColor = branding.accentColor ?? 'rgb(var(--primary))'

  return (
    <header
      className={cn(
        'border-b border-border bg-card px-4 py-4 shadow-sm',
        className
      )}
    >
      <div className="container mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt="Studio logo"
              className="h-10 w-auto shrink-0 object-contain"
            />
          ) : (
            <span
              className="text-xl font-semibold"
              style={{ color: accentColor }}
            >
              Archject
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold text-foreground sm:text-xl">
              {decisionTitle}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {instructions}
            </p>
          </div>
          {helpTip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  asChild
                  className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Help"
                >
                  <HelpCircle className="h-5 w-5" />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p>{helpTip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </header>
  )
}
