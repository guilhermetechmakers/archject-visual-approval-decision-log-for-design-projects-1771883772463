/**
 * PreviewPane - live WYSIWYG preview of client-facing pages using current branding.
 * Renders Client Portal, Project Workspace, and No-Login Portal previews.
 */

import { useMemo } from 'react'
import { Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { WorkspaceBranding } from '@/types/settings'

export interface PreviewPaneProps {
  branding: Partial<WorkspaceBranding>
  variant?: 'portal' | 'workspace' | 'minimal'
  className?: string
}

export function PreviewPane({
  branding,
  className,
}: PreviewPaneProps) {
  const accentColor = branding.accentColor ?? '#195C4A'
  const logoUrl = branding.logoUrl ?? null
  const headerText = branding.headerText ?? 'Design Approval Portal'
  const footerText = branding.footerText ?? 'Powered by Archject'

  const previewStyles = useMemo(
    () => ({
      '--preview-accent': accentColor,
    } as React.CSSProperties),
    [accentColor]
  )

  return (
    <Card
      className={cn(
        'overflow-hidden rounded-xl border border-border shadow-card',
        className
      )}
    >
      <CardHeader className="border-b border-border py-4">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Live preview</CardTitle>
        </div>
        <CardDescription>
          How your branding appears on client-facing pages
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div
          className="min-h-[280px] bg-[#F5F6FA] p-6"
          style={previewStyles}
        >
          {/* Simulated client portal header */}
          <div
            className="rounded-t-xl border border-border bg-white px-6 py-4 shadow-sm"
            style={{ borderBottomColor: `${accentColor}40` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt=""
                    className="h-8 w-8 object-contain"
                  />
                ) : (
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-xs font-semibold"
                    style={{ backgroundColor: accentColor }}
                  >
                    A
                  </div>
                )}
                <span className="text-sm font-medium text-[#23272F]">
                  {headerText}
                </span>
              </div>
            </div>
          </div>

          {/* Simulated content area */}
          <div className="rounded-b-xl border border-t-0 border-border bg-white px-6 py-8">
            <div className="space-y-4">
              <div className="h-3 w-24 rounded bg-secondary" />
              <div className="h-3 w-full rounded bg-secondary/70" />
              <div className="h-3 w-4/5 rounded bg-secondary/50" />
              <div className="mt-6 flex gap-2">
                <div
                  className="h-9 w-24 rounded-lg"
                  style={{ backgroundColor: accentColor }}
                />
                <div className="h-9 w-24 rounded-lg border border-border bg-white" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center text-xs text-[#6B7280]">
            {footerText}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
