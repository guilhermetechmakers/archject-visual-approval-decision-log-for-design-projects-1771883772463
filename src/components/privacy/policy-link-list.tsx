import { cn } from '@/lib/utils'

export interface PolicyLink {
  id: string
  title: string
}

export interface PolicyLinkListProps {
  links: PolicyLink[]
  className?: string
}

export function PolicyLinkList({ links, className }: PolicyLinkListProps) {
  return (
    <nav
      aria-label="Privacy policy sections"
      className={cn('flex flex-col gap-2', className)}
    >
      <div className="text-sm font-medium text-muted-foreground mb-1">
        Jump to section
      </div>
      <ul className="list-none space-y-1">
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={`#${link.id}`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-2 py-1 block"
            >
              {link.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
