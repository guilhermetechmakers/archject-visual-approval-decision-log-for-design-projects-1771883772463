import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export interface FooterNavProps {
  className?: string
}

export function FooterNav({ className }: FooterNavProps) {
  return (
    <nav
      className={cn('flex items-center justify-center gap-6 text-sm', className)}
      aria-label="Footer navigation"
    >
      <Link
        to="/terms"
        className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
      >
        Terms
      </Link>
      <Link
        to="/privacy"
        className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
      >
        Privacy
      </Link>
      <Link
        to="/demo-request"
        className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
      >
        Help
      </Link>
    </nav>
  )
}
