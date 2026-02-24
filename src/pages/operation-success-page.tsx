/**
 * Operation Success Page - standalone page for post-operation success state
 * Used when redirecting from checkout, share link creation, or export flows
 */

import { useNavigate, useSearchParams } from 'react-router-dom'
import { OperationSuccessCard } from '@/components/operation-success'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDecisionLogExport } from '@/hooks/use-exports'

type SuccessType =
  | 'payment_completed'
  | 'invoice_created'
  | 'export_generated'
  | 'share_link_created'
  | 'generic'

const SUCCESS_CONFIG: Record<
  SuccessType,
  { title: string; message: string; defaultAction: string; defaultHref: string }
> = {
  payment_completed: {
    title: 'Payment successful',
    message: 'Your payment has been processed. Your subscription is now active.',
    defaultAction: 'Go to Billing',
    defaultHref: '/dashboard/billing',
  },
  invoice_created: {
    title: 'Invoice requested',
    message:
      'Your invoice has been created and will be sent to your email. Your subscription will activate once payment is received.',
    defaultAction: 'Go to Billing',
    defaultHref: '/dashboard/billing',
  },
  export_generated: {
    title: 'Export generated',
    message: 'Your decision export has been generated. You can download it below.',
    defaultAction: 'View project',
    defaultHref: '/dashboard/projects',
  },
  share_link_created: {
    title: 'Share link created',
    message:
      'Your secure client portal link has been created. Share it with your client to get their feedback.',
    defaultAction: 'View decisions',
    defaultHref: '/dashboard/decisions',
  },
  generic: {
    title: 'Success',
    message: 'Operation completed successfully.',
    defaultAction: 'Continue',
    defaultHref: '/dashboard',
  },
}

export function OperationSuccessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const type = (searchParams.get('type') as SuccessType) ?? 'generic'
  const projectName = searchParams.get('project') ?? ''
  const projectId = searchParams.get('projectId') ?? ''
  const decisionLogId = searchParams.get('decisionLogId') ?? ''
  const redirectTo = searchParams.get('redirect') ?? ''
  const tipParam = searchParams.get('tip') ?? ''

  const config = SUCCESS_CONFIG[type] ?? SUCCESS_CONFIG.generic
  const defaultHref = redirectTo || config.defaultHref

  const {
    exportPdf,
    exportCsv,
    exportJson,
    isExporting,
    exportingFormat,
  } = useDecisionLogExport({
    projectId: projectId || undefined,
    decisionLogId: decisionLogId || undefined,
    decisionIds: decisionLogId ? [decisionLogId] : undefined,
  })

  const exportOptions =
    type === 'export_generated' && (projectId || decisionLogId)
      ? [
          { type: 'PDF' as const, action: exportPdf },
          { type: 'CSV' as const, action: exportCsv },
          { type: 'JSON' as const, action: exportJson },
        ]
      : undefined

  const summary: Array<{ label: string; value: string }> = []
  if (projectName) summary.push({ label: 'Project', value: projectName })
  if (projectId) summary.push({ label: 'Project ID', value: projectId })
  if (decisionLogId) summary.push({ label: 'Decision Log', value: decisionLogId })
  summary.push({ label: 'Time', value: new Date().toLocaleString() })

  const handleClose = () => {
    navigate(defaultHref)
  }

  return (
    <div className="min-h-screen bg-secondary/30 px-4 py-8 animate-fade-in">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to={defaultHref} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <OperationSuccessCard
          title={config.title}
          message={config.message}
          summary={summary.length > 0 ? summary : undefined}
          actions={[
            {
              label: config.defaultAction,
              onClick: handleClose,
              variant: 'primary',
            },
          ]}
          exportOptions={exportOptions}
          isExporting={isExporting}
          exportingFormat={exportingFormat}
          showClose={false}
          onClose={handleClose}
          tip={
            tipParam ||
            (type === 'export_generated'
              ? 'Export includes attached file references. You can share this link with clients.'
              : undefined)
          }
          asPage
        />
      </div>
    </div>
  )
}
