import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DemoRequestModal } from '@/components/landing/demo-request-modal'

const navLinks = [
  { to: '/#features', label: 'Features' },
  { to: '/#how-it-works', label: 'How it works' },
  { to: '/#pricing', label: 'Pricing' },
  { to: '/#testimonials', label: 'Testimonials' },
] as const

export function NavigationHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [demoModalOpen, setDemoModalOpen] = useState(false)

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        role="banner"
      >
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            Archject
          </Link>

          {/* Desktop nav - pill-shaped tabs */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-pill px-4 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setDemoModalOpen(true)}
              aria-label="Request demo"
            >
              Request demo
            </Button>
            <Link to="/auth/login">
              <Button variant="ghost" aria-label="Log in">
                Log in
              </Button>
            </Link>
            <Link to="/auth/signup">
              <Button aria-label="Start free">Start free</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div
            className="absolute inset-x-0 top-16 border-t border-border bg-background md:hidden animate-fade-in"
            role="dialog"
            aria-label="Mobile menu"
          >
            <nav className="flex flex-col gap-1 p-4" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => {
                    setDemoModalOpen(true)
                    setMobileOpen(false)
                  }}
                >
                  Request demo
                </Button>
                <Link to="/auth/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-center">
                    Log in
                  </Button>
                </Link>
                <Link to="/auth/signup" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full justify-center">Start free</Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <DemoRequestModal open={demoModalOpen} onOpenChange={setDemoModalOpen} />
    </>
  )
}
