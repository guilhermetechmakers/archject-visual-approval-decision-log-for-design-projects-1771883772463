import * as React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface SectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string
  title: string
  children: React.ReactNode
}

export function SectionCard({ id, title, children, className, ...props }: SectionCardProps) {
  return (
    <Card
      id={id}
      className={cn(
        'rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-200 hover:shadow-card-hover',
        className
      )}
      {...props}
    >
      <CardHeader className="p-0 pb-4">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </CardHeader>
      <CardContent className="p-0">
        <div className="prose prose-gray max-w-none text-foreground prose-p:leading-relaxed prose-strong:text-foreground">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}
