import { NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navLinks = [
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
]

export function HeaderNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="text-xl font-semibold text-primary">Archject</span>
        </NavLink>
        <nav className="hidden md:flex items-center gap-6">
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
          <NavLink to="/login">
            <Button variant="ghost">Log in</Button>
          </NavLink>
          <NavLink to="/signup">
            <Button>Get started</Button>
          </NavLink>
        </div>
      </div>
    </header>
  )
}
