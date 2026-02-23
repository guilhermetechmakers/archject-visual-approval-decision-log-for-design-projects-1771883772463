import { Link } from 'react-router-dom'
import { LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface DashboardCTAProps {
  verified: boolean
  className?: string
}

/**
 * Button that navigates to Dashboard when verified; hidden when not verified.
 */
export function DashboardCTA({ verified, className }: DashboardCTAProps) {
  if (!verified) return null

  return (
    <Link to="/dashboard" className={cn('block', className)}>
      <Button
        className="w-full rounded-pill bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] hover:shadow-md active:scale-[0.98] transition-all duration-200"
        aria-label="Go to Dashboard"
      >
        <LayoutDashboard className="h-4 w-4" />
        Go to Dashboard
      </Button>
    </Link>
  )
}
