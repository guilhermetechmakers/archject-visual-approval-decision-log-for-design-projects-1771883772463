import { Check, Paperclip } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ClientPortalOption } from '@/types/client-portal'

function getFirstMediaUrl(opt: ClientPortalOption): string | null {
  const first = opt.mediaAssets?.[0] ?? opt.mediaUrls?.[0]
  return typeof first === 'string' ? first : (first as { url?: string })?.url ?? null
}

export interface OptionCardProps {
  option: ClientPortalOption
  isSelected?: boolean
  onSelect?: () => void
  accentColor?: string
  className?: string
}

export function OptionCard({
  option,
  isSelected = false,
  onSelect,
  accentColor = 'rgb(var(--primary))',
  className,
}: OptionCardProps) {
  const thumbUrl = getFirstMediaUrl(option)

  return (
    <Card
      className={cn(
        'overflow-hidden rounded-xl border-2 transition-all duration-200 hover:shadow-card-hover',
        isSelected
          ? 'border-primary shadow-card ring-2 ring-primary/20'
          : 'border-border hover:border-primary/50',
        className
      )}
    >
      <CardContent className="p-0">
        <button
          type="button"
          onClick={onSelect}
          className="flex w-full flex-col text-left focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <div className="flex flex-col sm:flex-row">
            <div className="flex h-32 w-full shrink-0 items-center justify-center bg-secondary/50 sm:h-36 sm:w-40">
              {thumbUrl ? (
                <img
                  src={thumbUrl}
                  alt={option.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <Paperclip className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-foreground">{option.title}</h3>
                {isSelected && (
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              {option.description && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {option.description}
                </p>
              )}
            </div>
          </div>
        </button>
      </CardContent>
    </Card>
  )
}
