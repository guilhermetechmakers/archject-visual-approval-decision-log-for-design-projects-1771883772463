/**
 * SuccessModal - Generic success state for export completion
 * Reusable modal with customizable messaging and CTAs
 */

import { useNavigate } from 'react-router-dom'
import { Check, Download, ArrowLeft } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SuccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  message?: string
  downloadUrl?: string | null
  downloadFilename?: string
  projectId?: string
  onViewProject?: () => void
  onClose?: () => void
  className?: string
}

export function SuccessModal({
  open,
  onOpenChange,
  title = 'Export generated',
  message = 'Your decision export has been generated. You can download it below.',
  downloadUrl,
  downloadFilename = 'decision-log-export',
  projectId,
  onViewProject,
  onClose,
  className,
}: SuccessModalProps) {
  const navigate = useNavigate()

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = downloadFilename
      a.click()
    }
  }

  const handleViewProject = () => {
    onOpenChange(false)
    if (onViewProject) {
      onViewProject()
    } else if (projectId) {
      navigate(`/dashboard/projects/${projectId}`)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    onClose?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-w-md rounded-2xl border border-border bg-card shadow-card',
          className
        )}
      >
        <DialogHeader>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
              <Check className="h-8 w-8 text-success" aria-hidden />
            </div>
            <DialogTitle className="mt-4 text-xl">{title}</DialogTitle>
            <DialogDescription className="mt-2">{message}</DialogDescription>
          </div>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          {downloadUrl && (
            <Button
              onClick={handleDownload}
              className="w-full rounded-full bg-primary text-primary-foreground transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
            >
              <Download className="mr-2 h-4 w-4" />
              Download export
            </Button>
          )}
        </div>
        <DialogFooter className="flex flex-wrap gap-2 sm:justify-center">
          {(projectId || onViewProject) && (
            <Button
              variant="outline"
              onClick={handleViewProject}
              className="rounded-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              View project
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleClose}
            className="rounded-full"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
