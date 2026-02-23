import { Link } from 'react-router-dom'
import { Check, FileCheck, Share2, Download } from 'lucide-react'
import { HeaderNav } from '@/components/layout/header-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderNav />
      <main>
        <section className="relative overflow-hidden px-4 py-24 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="container relative mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Visual approval & decision log for{' '}
                <span className="text-primary">design projects</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                Replace scattered emails and PDFs with a structured, time-stamped
                workflow. Create decisions, share branded no-login links, and
                export defensible audit records.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start free trial
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Log in
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-secondary/30 px-4 py-24">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold text-foreground">
              How it works
            </h2>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {[
                {
                  step: 1,
                  icon: FileCheck,
                  title: 'Create decisions',
                  desc: 'Add options, upload visuals, set approvers and due dates. Use templates for common design choices.',
                },
                {
                  step: 2,
                  icon: Share2,
                  title: 'Share branded links',
                  desc: 'Clients review via no-login links. Side-by-side comparison on mobile and desktop. Optional OTP capture.',
                },
                {
                  step: 3,
                  icon: Download,
                  title: 'Export audit trail',
                  desc: 'Timestamped approvals, exportable Decision Logs (PDF/CSV/JSON) for contracts and compliance.',
                },
              ].map((item, i) => (
                <div
                  key={item.step}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="mt-2 text-muted-foreground">{item.desc}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-24">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold text-foreground">
              Built for design studios
            </h2>
            <ul className="mx-auto mt-12 max-w-2xl space-y-4">
              {[
                'Zero-friction client experience — no login required',
                'Visual side-by-side comparison, swipe on mobile',
                'Opinionated templates for finishes, layouts, change requests',
                'Exportable Decision Logs for contracts and permits',
                'Lightweight adoption — focused on approvals only',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-border bg-secondary/30 px-4 py-24">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-foreground">
              Ready to streamline approvals?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Join architecture and design studios using Archject for faster
              approvals and defensible records.
            </p>
            <Link to="/signup" className="mt-8 inline-block">
              <Button size="lg">Get started free</Button>
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-border px-4 py-12">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
          <span className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Archject. All rights reserved.
          </span>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link to="/cookies" className="text-sm text-muted-foreground hover:text-foreground">
              Cookies
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
