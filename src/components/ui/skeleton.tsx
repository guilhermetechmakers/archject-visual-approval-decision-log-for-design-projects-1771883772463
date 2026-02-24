import { cn } from '@/lib/utils'

/**
 * Skeleton component - design system aligned.
 * Uses --skeleton (247 248 250) and --skeleton-shimmer (230 232 240).
 * Same color families and shimmer treatment as other components.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md',
        'bg-[rgb(var(--skeleton))]',
        'animate-pulse',
        'before:absolute before:inset-0 before:bg-[length:200%_100%]',
        'before:bg-[linear-gradient(90deg,transparent,rgb(var(--skeleton-shimmer)),transparent)]',
        'before:animate-shimmer',
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
