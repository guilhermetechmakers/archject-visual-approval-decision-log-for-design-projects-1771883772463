/**
 * PreviewPane - renders client-facing pages using current branding tokens
 * Live WYSIWYG for branding changes
 */

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { DEFAULT_PRIMARY_HEX, DEFAULT_ACCENT_HEX } from '@/lib/design-tokens'
import type { BrandingTokens } from '@/types/branding'

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
  const accentColor = tokens.colorTokens?.accent ?? tokens.accentColor ?? DEFAULT_ACCENT_HEX
  const primaryColor = tokens.colorTokens?.primary ?? DEFAULT_PRIMARY_HEX
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
          className="rounded-lg border border-border bg-card p-0 shadow-inner"
          style={previewStyle}
        >
          {/* Simulated client portal header */}
          <header
            className="flex items-center gap-4 border-b border-border px-4 py-3"
            style={{ backgroundColor: 'rgb(var(--card))' }}
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
              <h2 className="truncate text-sm font-semibold text-foreground">
                {tokens.headerText || sampleContent}
              </h2>
              <p className="text-xs text-muted-foreground">
                Please review the options below.
              </p>
            </div>
          </header>

          {/* Simulated content area */}
          <div
            className="flex h-32 items-center justify-center gap-4 bg-secondary/50 px-4"
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
              className="border-t border-border px-4 py-2 text-center text-xs text-muted-foreground"
              style={{ backgroundColor: 'rgb(var(--card))' }}
            >
              {tokens.footerText}
            </footer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
