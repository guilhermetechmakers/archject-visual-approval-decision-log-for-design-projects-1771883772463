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
        'scroll-mt-24 transition-all duration-200 hover:shadow-card-hover',
        className
      )}
      {...props}
    >
      <CardHeader className="pb-2">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </CardHeader>
      <CardContent className="prose prose-gray max-w-none text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
        {children}
      </CardContent>
    </Card>
  )
}
