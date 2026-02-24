import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

export interface RegionNoticeProps {
  region: string
  content: string
  variant?: 'default' | 'success' | 'warning' | 'secondary'
  defaultOpen?: boolean
  className?: string
}

const regionVariants: Record<string, 'default' | 'success' | 'warning' | 'secondary'> = {
  EU: 'success',
  US: 'secondary',
  APAC: 'secondary',
  OTHER: 'default',
}

export function RegionNotice({
  region,
  content,
  variant,
  defaultOpen = false,
  className,
}: RegionNoticeProps) {
  const resolvedVariant = variant ?? regionVariants[region] ?? 'default'

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-muted/50 p-4 transition-all duration-200',
        className
      )}
      role="region"
      aria-label={`Region notice for ${region}`}
    >
      <Accordion type="single" collapsible defaultValue={defaultOpen ? region : undefined}>
        <AccordionItem value={region} className="border-0">
          <AccordionTrigger className="py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <Badge variant={resolvedVariant}>{region}</Badge>
              <span className="text-sm font-medium text-foreground">
                Region-specific notice
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="prose prose-sm prose-gray max-w-none pt-2 text-muted-foreground [&_strong]:text-foreground">
              {content.split(/\n\n+/).map((para, i) => (
                <p key={i} className="mb-2 last:mb-0">
                  {para.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
                    part.startsWith('**') && part.endsWith('**') ? (
                      <strong key={j} className="font-semibold text-foreground">
                        {part.slice(2, -2)}
                      </strong>
                    ) : (
                      <span key={j}>{part}</span>
                    )
                  )}
                </p>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
