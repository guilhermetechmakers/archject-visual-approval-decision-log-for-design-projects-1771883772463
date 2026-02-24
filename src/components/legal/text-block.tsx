import { cn } from '@/lib/utils'

export interface TextBlockProps {
  content: string
  className?: string
}

/**
 * Renders rich text content with support for paragraphs and bold markdown.
 */
export function TextBlock({ content, className }: TextBlockProps) {
  const paragraphs = content.split(/\n\n+/).filter(Boolean)

  return (
    <div className={cn('space-y-4', className)}>
      {paragraphs.map((para, i) => {
        const parts = para.split(/(\*\*[^*]+\*\*)/g)
        return (
          <p key={i} className="leading-relaxed text-foreground">
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**') ? (
                <strong key={j} className="font-semibold text-foreground">
                  {part.slice(2, -2)}
                </strong>
              ) : (
                <span key={j}>{part}</span>
              )
            )}
          </p>
        )
      })}
    </div>
  )
}
