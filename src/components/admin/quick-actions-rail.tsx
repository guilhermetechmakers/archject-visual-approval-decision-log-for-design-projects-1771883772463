/**
 * Quick Actions Rail - export data, maintenance, billing, user management.
 * Design: pill-shaped buttons, deep green primary, 8px spacing.
 */

import * as React from 'react'
import { Link } from 'react-router-dom'
import {
  UserPlus,
  TicketPlus,
  UserCog,
  Download,
  Wrench,
  CreditCard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ComplianceExportModal } from './compliance-export-modal'
import { MaintenanceWindowModal } from './maintenance-window-modal'
import { useComplianceExport, useMaintenanceWindow } from '@/hooks/use-admin'

interface QuickActionsRailProps {
  className?: string
}

export function QuickActionsRail({ className }: QuickActionsRailProps) {
  const [exportModalOpen, setExportModalOpen] = React.useState(false)
  const [maintenanceModalOpen, setMaintenanceModalOpen] = React.useState(false)
  const complianceExportMutation = useComplianceExport()
  const maintenanceMutation = useMaintenanceWindow()

  return (
    <>
      <div
        className={cn(
          'flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-4 shadow-card transition-shadow hover:shadow-card-hover',
          className
        )}
      >
        <span className="flex w-full items-center text-sm font-medium text-muted-foreground sm:w-auto">
          Quick actions
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExportModalOpen(true)}
          className="rounded-full"
        >
          <Download className="mr-2 h-4 w-4" />
          Export data
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMaintenanceModalOpen(true)}
          className="rounded-full"
        >
          <Wrench className="mr-2 h-4 w-4" />
          Maintenance
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/tools?tab=billing">
            <CreditCard className="mr-2 h-4 w-4" />
            Billing exceptions
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/users">
            <UserPlus className="mr-2 h-4 w-4" />
            User Management
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/tools">
            <TicketPlus className="mr-2 h-4 w-4" />
            Create Escalation
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/users">
            <UserCog className="mr-2 h-4 w-4" />
            Impersonate
          </Link>
        </Button>
      </div>

      <ComplianceExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        onConfirm={(scope, format) => {
          complianceExportMutation.mutate({ scope, format })
        }}
        isLoading={complianceExportMutation.isPending}
      />

      <MaintenanceWindowModal
        open={maintenanceModalOpen}
        onOpenChange={setMaintenanceModalOpen}
        onConfirm={(reason, durationMinutes) => {
          maintenanceMutation.mutate({
            action: 'start',
            message: reason,
            durationMinutes,
          })
          setMaintenanceModalOpen(false)
        }}
        isLoading={maintenanceMutation.isPending}
      />
    </>
  )
}
