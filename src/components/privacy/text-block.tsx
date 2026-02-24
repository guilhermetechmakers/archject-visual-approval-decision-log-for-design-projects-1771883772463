import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  content: string
}

/**
 * Renders policy content as paragraphs with proper list formatting.
 * Supports newlines and bullet points (lines starting with •).
 */
export function TextBlock({ content, className, ...props }: TextBlockProps) {
  const paragraphs = content.split(/\n\n+/).filter(Boolean)

  return (
    <div className={cn('space-y-4', className)} {...props}>
      {paragraphs.map((para, i) => {
        const lines = para.split('\n').filter(Boolean)
        const hasBullets = lines.some((l) => l.trim().startsWith('•'))

        if (hasBullets) {
          return (
            <div key={i} className="space-y-2">
              {lines.map((line, j) => {
                const trimmed = line.trim()
                if (trimmed.startsWith('•')) {
                  return (
                    <div key={j} className="flex gap-2 pl-4">
                      <span className="text-primary shrink-0">•</span>
                      <span className="text-muted-foreground">{trimmed.slice(1).trim()}</span>
                    </div>
                  )
                }
                return (
                  <p key={j} className="text-muted-foreground leading-relaxed">
                    {trimmed}
                  </p>
                )
              })}
            </div>
          )
        }

        return (
          <p key={i} className="text-muted-foreground leading-relaxed">
            {para}
          </p>
        )
      })}
    </div>
  )
}
