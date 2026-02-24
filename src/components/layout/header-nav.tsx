import { NavLink, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuthOptional } from '@/contexts/auth-context'

const navLinks = [
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
  { to: '/cookies', label: 'Cookies' },
]

export function HeaderNav() {
  const auth = useAuthOptional()
  const isAuthenticated = auth?.isAuthenticated ?? false

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden"
      role="banner"
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <NavLink
          to="/"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          <span className="text-xl font-semibold text-primary">Archject</span>
        </NavLink>
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button aria-label="Go to Dashboard">Dashboard</Button>
            </Link>
          ) : (
            <>
              <NavLink to="/login">
                <Button variant="ghost" aria-label="Log in">
                  Log in
                </Button>
              </NavLink>
              <NavLink to="/signup">
                <Button aria-label="Get started">Get started</Button>
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
