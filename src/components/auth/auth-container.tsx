import { Link } from 'react-router-dom'
import { LayoutGrid } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { FooterNav } from './footer-nav'
import { cn } from '@/lib/utils'

export interface AuthContainerProps {
  children: React.ReactNode
  title: string
  description?: string
  className?: string
}

export function AuthContainer({
  children,
  title,
  description,
  className,
}: AuthContainerProps) {
  return (
    <div
      className={cn(
        'min-h-screen flex flex-col bg-gradient-to-br from-secondary/30 via-background to-accent/5',
        className
      )}
    >
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left: form content */}
        <div className="flex-1 flex items-center justify-center px-4 py-12 lg:py-16">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xl font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded mb-8"
            >
              Archject
            </Link>
            <Card className="shadow-card border-border rounded-2xl overflow-hidden">
              <CardHeader className="pb-2">
                <h1 className="text-2xl font-semibold text-foreground">
                  {title}
                </h1>
                {description && (
                  <p className="text-muted-foreground mt-1">{description}</p>
                )}
              </CardHeader>
              <CardContent className="pt-2">{children}</CardContent>
            </Card>
          </div>
        </div>

        {/* Right: illustration panel - visible on larger viewports */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-secondary/20">
          <div className="max-w-md text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-primary/10 text-primary mb-6">
              <LayoutGrid className="h-12 w-12" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Visual approval & decision log
            </h2>
            <p className="text-muted-foreground">
              Create decisions, share branded links, and export audit records for
              your design projects.
            </p>
          </div>
        </div>
      </div>

      <footer className="py-6">
        <FooterNav />
      </footer>
    </div>
  )
}
