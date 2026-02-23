import { HeaderNav } from '@/components/layout/header-nav'

export function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderNav />
      <main className="container mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold">Cookie Policy</h1>
        <p className="mt-4 text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="prose prose-gray mt-8 max-w-none">
          <h2>What are cookies</h2>
          <p>
            Cookies are small text files stored on your device when you visit our website.
            They help us provide a better experience.
          </p>
          <h2>How we use cookies</h2>
          <p>
            We use essential cookies for authentication and session management. We may use
            analytics cookies to understand how our service is used.
          </p>
          <h2>Managing cookies</h2>
          <p>
            You can control cookies through your browser settings. Disabling certain cookies
            may affect the functionality of our service.
          </p>
        </div>
      </main>
    </div>
  )
}
