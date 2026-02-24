import { cn } from '@/lib/utils'

export interface PolicyLinkItem {
  id: string
  title: string
}

export interface PolicyLinkListProps {
  items: PolicyLinkItem[]
  className?: string
}

export function PolicyLinkList({ items, className }: PolicyLinkListProps) {
  return (
    <nav
      aria-label="Policy section navigation"
      className={cn('flex flex-wrap gap-2', className)}
    >
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={cn(
            'rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors',
            'hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
        >
          {item.title}
        </a>
      ))}
    </nav>
  )
}
