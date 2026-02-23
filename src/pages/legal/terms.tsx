import { HeaderNav } from '@/components/layout/header-nav'

export function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderNav />
      <main className="container mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="mt-4 text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="prose prose-gray mt-8 max-w-none">
          <h2>1. Acceptance</h2>
          <p>
            By using Archject, you agree to these terms. If you do not agree, do not use our services.
          </p>
          <h2>2. Service description</h2>
          <p>
            Archject provides a visual approval and decision log platform for design projects.
            We reserve the right to modify or discontinue the service at any time.
          </p>
          <h2>3. User responsibilities</h2>
          <p>
            You are responsible for the accuracy of data you provide and for maintaining
            the security of your account credentials.
          </p>
        </div>
      </main>
    </div>
  )
}
