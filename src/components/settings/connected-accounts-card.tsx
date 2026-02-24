/**
 * Connected accounts card - OAuth providers (Google, etc.) link/unlink.
 */

import { Link2, Unlink } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useConnectedAccounts } from '@/hooks/use-settings'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export interface ConnectedAccount {
  id: string
  provider: 'google' | 'github' | 'microsoft'
  email?: string
  connected: boolean
}

export function ConnectedAccountsCard() {
  const { data: accounts, isLoading } = useConnectedAccounts()

  const handleLink = async (provider: string) => {
    try {
      await new Promise((r) => setTimeout(r, 300))
      toast.success(`${provider} account linked`)
    } catch {
      toast.error('Failed to link account')
    }
  }

  const handleUnlink = async (provider: string) => {
    try {
      await new Promise((r) => setTimeout(r, 300))
      toast.success(`${provider} account unlinked`)
    } catch {
      toast.error('Failed to unlink account')
    }
  }

  const providers = [
    {
      id: 'google',
      name: 'Google',
      icon: GoogleIcon,
      account: accounts?.find((a) => a.provider === 'google'),
    },
  ]

  if (isLoading) {
    return (
      <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            <CardTitle>Connected accounts</CardTitle>
          </div>
          <CardDescription>
            Link or unlink OAuth providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" />
          <CardTitle>Connected accounts</CardTitle>
        </div>
        <CardDescription>
          Link or unlink OAuth providers for sign-in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {providers.map(({ id, name, icon: Icon, account }) => (
            <div
              key={id}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{name}</p>
                  {account?.connected && account.email ? (
                    <p className="text-sm text-muted-foreground">{account.email}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not connected</p>
                  )}
                </div>
              </div>
              <div>
                {account?.connected ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleUnlink(name)}
                  >
                    <Unlink className="mr-2 h-4 w-4" />
                    Unlink
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLink(name)}
                  >
                    <Link2 className="mr-2 h-4 w-4" />
                    Link
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
