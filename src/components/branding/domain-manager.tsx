/**
 * DomainManager - Custom domain/prefix, DNS status, TLS status, provisioning
 */

import { useState } from 'react'
import {
  Globe,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const DOMAIN_PREFIX_REGEX = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/
const DOMAIN_REGEX = /^[a-z0-9]([a-z0-9.-]{1,61}[a-z0-9])?\.(com|co|app|io|net|org)$/i

export interface DomainConfig {
  domain?: string | null
  prefix?: string | null
  tlsStatus?: 'pending' | 'provisioning' | 'active' | 'expired' | 'error'
  certificateArn?: string | null
  issuedAt?: string | null
  expiresAt?: string | null
}

export interface DomainManagerProps {
  config: DomainConfig
  onConfigChange: (config: Partial<DomainConfig>) => void
  onProvision?: () => Promise<void>
  clientPortalBaseUrl?: string
  className?: string
}

const TLS_STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
  pending: { label: 'Pending', variant: 'secondary', icon: AlertCircle },
  provisioning: { label: 'Provisioning', variant: 'outline', icon: Loader2 },
  active: { label: 'Active', variant: 'default', icon: CheckCircle },
  expired: { label: 'Expired', variant: 'destructive', icon: AlertCircle },
  error: { label: 'Error', variant: 'destructive', icon: AlertCircle },
}

export function DomainManager({
  config,
  onConfigChange,
  onProvision,
  clientPortalBaseUrl = 'https://clients.archject.app',
  className,
}: DomainManagerProps) {
  const [domain, setDomain] = useState(config.domain ?? '')
  const [prefix, setPrefix] = useState(config.prefix ?? '')
  const [isProvisioning, setIsProvisioning] = useState(false)
  const [domainError, setDomainError] = useState<string | null>(null)
  const [prefixError, setPrefixError] = useState<string | null>(null)

  const validatePrefix = (v: string) => {
    if (!v) return true
    if (v.length < 3 || v.length > 63) return false
    return DOMAIN_PREFIX_REGEX.test(v)
  }

  const validateDomain = (v: string) => {
    if (!v) return true
    return DOMAIN_REGEX.test(v) || /^[a-z0-9][a-z0-9.-]{0,61}[a-z0-9]$/i.test(v)
  }

  const handleSave = () => {
    setDomainError(null)
    setPrefixError(null)
    if (prefix && !validatePrefix(prefix)) {
      setPrefixError('Use 3–63 chars, alphanumeric and hyphens only')
      return
    }
    if (domain && !validateDomain(domain)) {
      setDomainError('Enter a valid domain (e.g. client.yourstudio.com)')
      return
    }
    onConfigChange({ domain: domain || null, prefix: prefix || null })
  }

  const handleProvision = async () => {
    if (!onProvision) return
    setIsProvisioning(true)
    try {
      await onProvision()
    } finally {
      setIsProvisioning(false)
    }
  }

  const displayPrefix = prefix || config.prefix || 'your-studio'
  const clientPortalUrl = domain
    ? `https://${domain}`
    : `${clientPortalBaseUrl}/${displayPrefix}`

  const tlsStatus = config.tlsStatus ?? 'pending'
  const statusConfig = TLS_STATUS_MAP[tlsStatus] ?? TLS_STATUS_MAP.pending
  const StatusIcon = statusConfig.icon

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
          Custom domain or URL prefix for client-facing links. TLS/SSL provisioning for enterprise.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="domain-prefix">URL prefix</Label>
          <Input
            id="domain-prefix"
            type="text"
            placeholder="your-studio"
            value={prefix || domain ? '' : (config.prefix ?? '')}
            onChange={(e) => {
              setPrefix(e.target.value)
              setPrefixError(null)
            }}
            className={cn(prefixError && 'border-destructive')}
          />
          <p className="text-xs text-muted-foreground">
            3–63 chars, alphanumeric and hyphens. Used when no custom domain is set.
          </p>
          {prefixError && <p className="text-xs text-destructive">{prefixError}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom-domain">Custom domain (optional)</Label>
          <Input
            id="custom-domain"
            type="text"
            placeholder="client.yourstudio.com"
            value={domain || (config.domain ?? '')}
            onChange={(e) => {
              setDomain(e.target.value)
              setDomainError(null)
            }}
            className={cn(domainError && 'border-destructive')}
          />
          <p className="text-xs text-muted-foreground">
            Enterprise: Add your domain and configure CNAME to point to client links.
          </p>
          {domainError && <p className="text-xs text-destructive">{domainError}</p>}
        </div>

        {domain && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-secondary/30 px-4 py-3">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">TLS status</span>
            <Badge
              variant={statusConfig.variant}
              className={cn(
                'gap-1 rounded-full',
                tlsStatus === 'active' && 'bg-primary text-primary-foreground'
              )}
            >
              {tlsStatus === 'provisioning' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <StatusIcon className="h-3 w-3" />
              )}
              {statusConfig.label}
            </Badge>
            {onProvision && tlsStatus !== 'active' && tlsStatus !== 'provisioning' && (
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={handleProvision}
                disabled={isProvisioning}
              >
                {isProvisioning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Provision TLS
              </Button>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label>Client portal link preview</Label>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2">
            <code className="flex-1 truncate text-sm text-muted-foreground">
              {clientPortalUrl}
            </code>
            <Button variant="ghost" size="icon" asChild>
              <a
                href={clientPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open preview"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            className="rounded-full transition-all duration-200 hover:scale-[1.02]"
          >
            Save domain config
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
