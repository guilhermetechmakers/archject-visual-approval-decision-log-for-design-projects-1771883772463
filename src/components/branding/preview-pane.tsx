/**
 * PreviewPane - renders client-facing pages using current branding tokens
 * Live WYSIWYG for branding changes
 */

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { BrandingTokens, ColorTokens } from '@/types/branding'

export interface PreviewPaneProps {
  tokens: Partial<BrandingTokens>
  sampleContent?: string
  className?: string
}

export function PreviewPane({
  tokens,
  sampleContent = 'Design Approval Portal',
  className,
}: PreviewPaneProps) {
  const accentColor = tokens.colorTokens?.accent ?? tokens.accentColor ?? '#195C4A'
  const primaryColor = tokens.colorTokens?.primary ?? '#195C4A'
  const logoUrl = tokens.logoUrl

  const previewStyle = useMemo(
    () => ({
      '--preview-primary': primaryColor,
      '--preview-accent': accentColor,
    } as React.CSSProperties),
    [primaryColor, accentColor]
  )

  return (
    <Card
      className={cn(
        'overflow-hidden rounded-xl border border-border shadow-card transition-all duration-200',
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Live preview</CardTitle>
        <CardDescription>
          How your branding will appear on the client portal and project pages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="rounded-lg border border-border bg-white p-0 shadow-inner"
          style={previewStyle}
        >
          {/* Simulated client portal header */}
          <header
            className="flex items-center gap-4 border-b border-[#E6E8F0] px-4 py-3"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="h-8 w-auto object-contain"
              />
            ) : (
              <span
                className="text-lg font-semibold"
                style={{ color: accentColor }}
              >
                Archject
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-semibold text-[#23272F]">
                {tokens.headerText || sampleContent}
              </h2>
              <p className="text-xs text-[#6B7280]">
                Please review the options below.
              </p>
            </div>
          </header>

          {/* Simulated content area */}
          <div
            className="flex h-32 items-center justify-center gap-4 px-4"
            style={{ backgroundColor: '#F5F6FA' }}
          >
            <div
              className="flex h-12 w-24 items-center justify-center rounded-lg text-xs font-medium text-white"
              style={{ backgroundColor: accentColor }}
            >
              Option A
            </div>
            <div
              className="flex h-12 w-24 items-center justify-center rounded-lg border-2 border-dashed text-xs font-medium"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              Option B
            </div>
          </div>

          {/* Simulated footer */}
          {tokens.footerText && (
            <footer
              className="border-t border-[#E6E8F0] px-4 py-2 text-center text-xs text-[#6B7280]"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              {tokens.footerText}
            </footer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
