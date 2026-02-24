/**
 * 404 Not Found page - user-friendly recovery experience.
 * - Auth-aware primary CTA (Dashboard if authenticated, Home if not)
 * - Inline search for projects/decisions
 * - Back button with history.back() fallback
 * - Brand-consistent illustration and copy
 */

import { useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search } from 'lucide-react'
import { NavigationHeader } from '@/components/layout/navigation-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { NotFoundIllustration } from '@/components/illustrations'
import { InlineSearch } from '@/components/inline-search'
import { useAuthOptional } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'

export function NotFoundPage() {
  const navigate = useNavigate()
  const auth = useAuthOptional()
  const isAuthenticated = auth?.isAuthenticated ?? false
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(isAuthenticated ? '/dashboard' : '/', { replace: true })
    }
  }, [navigate, isAuthenticated])

  const focusSearch = useCallback(() => {
    searchInputRef.current?.focus()
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavigationHeader />
      <main
        className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24"
        role="main"
      >
        <Card
          className={cn(
            'w-full max-w-lg shadow-card rounded-2xl p-6 md:p-8',
            'animate-fade-in-up'
          )}
        >
          <CardContent className="flex flex-col items-center gap-6 p-0">
            <NotFoundIllustration size={200} className="shrink-0" />
            <div className="text-center space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                That page isn&apos;t here
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed max-w-sm">
                We couldn&apos;t find the resource you&apos;re looking for. It may
                have been moved or the link might be incorrect.
              </p>
            </div>

            <div className="w-full space-y-4">
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  to={isAuthenticated ? '/dashboard' : '/'}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-pill"
                >
                  <Button
                    size="lg"
                    aria-label={
                      isAuthenticated
                        ? 'Go to Dashboard'
                        : 'Go to Home'
                    }
                  >
                    {isAuthenticated ? 'Go to Dashboard' : 'Go to Home'}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={focusSearch}
                  aria-label="Focus search to find projects or decisions"
                >
                  <Search className="h-4 w-4" />
                  Search
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handleBack}
                  aria-label="Return to previous page"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </div>

              <InlineSearch
                placeholder="Search projects, decisions, or files…"
                inputRef={searchInputRef}
                aria-label="Search projects, decisions, or files"
                className="mx-auto"
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
