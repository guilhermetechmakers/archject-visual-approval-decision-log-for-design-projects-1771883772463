/**
 * DomainManager - custom domain/prefix configuration, DNS status, TLS status.
 * Enterprise: CNAME, TLS provisioning (Let's Encrypt or managed).
 */

import { useState } from 'react'
import { Globe, Shield, Loader2, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { DomainConfig } from '@/types/settings'

const DOMAIN_PREFIX_REGEX = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/
const DOMAIN_REGEX = /^[a-z0-9]([a-z0-9.-]{1,253}[a-z0-9])?$/

export interface DomainManagerProps {
  config: Partial<DomainConfig> | null
  onChange: (config: Partial<DomainConfig>) => void
  onSave?: () => Promise<void>
  isLoading?: boolean
  className?: string
}

const TLS_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  provisioning: 'Provisioning…',
  active: 'Active',
  expired: 'Expired',
  error: 'Error',
}

export function DomainManager({
  config,
  onChange,
  onSave,
  isLoading = false,
  className,
}: DomainManagerProps) {
  const [domain, setDomain] = useState(config?.domain ?? '')
  const [prefix, setPrefix] = useState(config?.prefix ?? '')
  const [domainError, setDomainError] = useState<string | null>(null)
  const [prefixError, setPrefixError] = useState<string | null>(null)

  const tlsStatus = config?.tlsStatus ?? 'pending'

  const validatePrefix = (value: string) => {
    if (!value) return true
    if (value.length < 3 || value.length > 63) return false
    return DOMAIN_PREFIX_REGEX.test(value)
  }

  const validateDomain = (value: string) => {
    if (!value) return true
    return DOMAIN_REGEX.test(value)
  }

  const handleSave = async () => {
    setDomainError(null)
    setPrefixError(null)
    if (prefix && !validatePrefix(prefix)) {
      setPrefixError('3–63 chars, alphanumeric and hyphens only')
      return
    }
    if (domain && !validateDomain(domain)) {
      setDomainError('Invalid domain format')
      return
    }
    onChange({ domain: domain || undefined, prefix: prefix || undefined })
    if (onSave) await onSave()
  }

  const statusBadge = () => {
    const variant =
      tlsStatus === 'active'
        ? 'success'
        : tlsStatus === 'error' || tlsStatus === 'expired'
          ? 'destructive'
          : 'secondary'
    return (
      <Badge variant={variant}>
        {tlsStatus === 'provisioning' && (
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
        )}
        {TLS_STATUS_LABELS[tlsStatus] ?? tlsStatus}
      </Badge>
    )
  }

  const clientLinkPreview = prefix
    ? `https://${prefix}.archject.app`
    : domain
      ? `https://${domain}`
      : 'https://clients.archject.app/your-studio'

  return (
    <Card
      className={cn(
        'rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <CardTitle>Domain & URL</CardTitle>
        </div>
        <CardDescription>
          Custom domain or URL prefix for client-facing links. TLS certificates
          are provisioned automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="domain-prefix">URL prefix</Label>
          <Input
            id="domain-prefix"
            placeholder="your-studio"
            value={prefix}
            onChange={(e) => {
              setPrefix(e.target.value)
              setPrefixError(null)
            }}
            className={cn(prefixError && 'border-destructive')}
          />
          <p className="text-xs text-muted-foreground">
            Subdomain: clients.archject.app/<strong>your-studio</strong>
          </p>
          {prefixError && (
            <p className="text-xs text-destructive">{prefixError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom-domain">Custom domain (Enterprise)</Label>
          <Input
            id="custom-domain"
            placeholder="client.yourstudio.com"
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value)
              setDomainError(null)
            }}
            className={cn(domainError && 'border-destructive')}
          />
          {domainError && (
            <p className="text-xs text-destructive">{domainError}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-secondary/30 px-4 py-3">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">TLS status:</span>
          {statusBadge()}
          {tlsStatus === 'active' && config?.expiresAt && (
            <span className="text-xs text-muted-foreground">
              Expires {new Date(config.expiresAt).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <Label>Client portal link preview</Label>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2">
            <code className="flex-1 truncate text-sm text-muted-foreground">
              {clientLinkPreview}
            </code>
          </div>
        </div>

        {onSave && (
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="transition-all duration-200 hover:scale-[1.02]"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Save domain config
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
