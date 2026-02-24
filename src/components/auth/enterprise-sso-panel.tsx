/**
 * Enterprise SSO flow panel - domain allowlist and SAML/OIDC options.
 * Progressive disclosure for enterprise authentication.
 */

import { useState } from 'react'
import { Building2, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface EnterpriseSSOPanelProps {
  className?: string
}

export function EnterpriseSSOPanel({ className }: EnterpriseSSOPanelProps) {
  const [domain, setDomain] = useState('')

  return (
    <Accordion type="single" collapsible className={cn('rounded-lg border border-border bg-secondary/30 overflow-hidden', className)}>
      <AccordionItem value="enterprise-sso" className="border-0">
        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-secondary/50">
          <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Building2 className="h-4 w-4" />
            Enterprise SSO / Domain sign-in
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="sso-domain" className="text-sm font-medium text-foreground">
                  Allowed domain
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" aria-hidden />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p>Users with emails from this domain can sign in via your IdP.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="sso-domain"
                type="text"
                placeholder="e.g. yourcompany.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="bg-background"
                aria-describedby="sso-domain-hint"
              />
              <p id="sso-domain-hint" className="text-xs text-muted-foreground">
                Contact your admin to add your domain to the allowlist.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              disabled
            >
              Sign in with SSO
            </Button>
            <p className="text-xs text-muted-foreground">
              SAML/OIDC integration is configured by your workspace admin.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
