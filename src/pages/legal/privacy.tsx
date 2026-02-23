import { HeaderNav } from '@/components/layout/header-nav'

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderNav />
      <main className="container mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-4 text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="prose prose-gray mt-8 max-w-none">
          <h2>1. Information we collect</h2>
          <p>
            We collect information you provide when creating an account, using our services,
            or contacting us. This may include email, name, workspace details, and project data.
          </p>
          <h2>2. How we use your information</h2>
          <p>
            We use your information to provide and improve our services, process approvals,
            send notifications, and comply with legal obligations.
          </p>
          <h2>3. Data sharing</h2>
          <p>
            We do not sell your data. We may share data with service providers who assist in
            operating our platform, subject to confidentiality agreements.
          </p>
          <h2>4. GDPR</h2>
          <p>
            If you are in the European Economic Area, you have rights including access,
            rectification, erasure, and data portability. Contact us to exercise these rights.
          </p>
        </div>
      </main>
    </div>
  )
}
