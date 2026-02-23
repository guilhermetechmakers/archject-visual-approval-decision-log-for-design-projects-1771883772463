import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ServerErrorPage() {
  const handleRetry = () => window.location.reload()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <AlertCircle className="h-24 w-24 text-destructive" />
      <h1 className="mt-6 text-4xl font-bold">500</h1>
      <p className="mt-2 text-center text-muted-foreground">
        Something went wrong on our end. Please try again.
      </p>
      <div className="mt-8 flex gap-4">
        <Button onClick={handleRetry}>Try again</Button>
        <a href="mailto:support@archject.com">
          <Button variant="outline">Contact support</Button>
        </a>
      </div>
    </div>
  )
}
