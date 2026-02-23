import { cn } from '@/lib/utils'

export interface CheckoutPageShellProps {
  children: React.ReactNode
  className?: string
}

export function CheckoutPageShell({ children, className }: CheckoutPageShellProps) {
  return (
    <div
      className={cn(
        'mx-auto max-w-6xl animate-fade-in',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CheckoutGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
      {children}
    </div>
  )
}

export function CheckoutMainColumn({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6">{children}</div>
}

export function CheckoutSidebarColumn({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
      {children}
    </div>
  )
}
