/**
 * Operation Success Page/Modal types
 */

import type { LucideIcon } from 'lucide-react'

export interface SuccessSummaryItem {
  label: string
  value: string
}

export interface SuccessAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  icon?: LucideIcon
}

export type ExportFormat = 'PDF' | 'CSV' | 'JSON'

export interface ExportOption {
  type: ExportFormat
  action: () => void | Promise<void>
}

export interface OperationSuccessProps {
  title: string
  message: string
  summary?: SuccessSummaryItem[]
  actions?: SuccessAction[]
  exportOptions?: ExportOption[]
  /** When provided, shows loading state on the active export button */
  isExporting?: boolean
  exportingFormat?: ExportFormat | null
  autoDismissMs?: number
  showClose?: boolean
  onClose?: () => void
  tip?: string
  /** When true, renders as page layout; when false, renders as modal content */
  asPage?: boolean
}
