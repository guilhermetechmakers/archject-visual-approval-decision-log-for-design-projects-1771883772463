import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CollapsibleSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
}

export function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
  className,
  headerClassName,
  contentClassName,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={cn('rounded-xl border border-border bg-card shadow-card', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex w-full items-center justify-between gap-2 px-6 py-4 text-left transition-colors hover:bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-t-xl',
          headerClassName
        )}
        aria-expanded={open}
        aria-controls={`collapsible-${title.replace(/\s/g, '-')}`}
        id={`collapsible-trigger-${title.replace(/\s/g, '-')}`}
      >
        <span className="font-semibold text-foreground">{title}</span>
        {open ? (
          <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        )}
      </button>
      <div
        id={`collapsible-${title.replace(/\s/g, '-')}`}
        role="region"
        aria-labelledby={`collapsible-trigger-${title.replace(/\s/g, '-')}`}
        className={cn(
          'overflow-hidden transition-all duration-200',
          open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className={cn('border-t border-border px-6 py-4', contentClassName)}>
          {children}
        </div>
      </div>
    </div>
  )
}
