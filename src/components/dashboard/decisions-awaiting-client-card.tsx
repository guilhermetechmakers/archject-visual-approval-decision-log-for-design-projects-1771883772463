/**
 * DecisionsAwaitingClientCard - Decisions needing client response
 */

import { Link } from 'react-router-dom'
import { FileCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ApprovalItem } from './approval-item'
import type { AwaitingApproval } from '@/types/dashboard'

interface DecisionsAwaitingClientCardProps {
  approvals: AwaitingApproval[]
  className?: string
}

export function DecisionsAwaitingClientCard({
  approvals,
  className,
}: DecisionsAwaitingClientCardProps) {
  return (
    <section className={className}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Decisions awaiting client</h2>
        <Link to="/dashboard/decisions">
          <Button variant="ghost" size="sm">
            View all
          </Button>
        </Link>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:shadow-card-hover">
        {approvals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileCheck className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 font-medium">All caught up</p>
            <p className="text-sm text-muted-foreground">
              No decisions awaiting client response
            </p>
            <Link to="/dashboard/decisions/new" className="mt-4">
              <Button size="sm" className="transition-all hover:scale-[1.02]">
                Create decision
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {approvals.map((approval) => (
              <ApprovalItem key={approval.decision_id} approval={approval} />
            ))}
            <Link to="/dashboard/decisions" className="mt-4 block">
              <Button variant="ghost" className="w-full">
                View all decisions
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
