-- Branding & Domain Config - Workspace branding extensions for custom domains
-- Domain/URL, TLS status, CNAME metadata for enterprise client links

-- Add domain_config to workspaces if not exists
ALTER TABLE public.workspaces
  ADD COLUMN IF NOT EXISTS domain_config JSONB DEFAULT '{}';

-- domain_config schema: { domain, prefix, tlsStatus, certificateArn, issuedAt, expiresAt }
COMMENT ON COLUMN public.workspaces.domain_config IS 'Custom domain/CNAME config: domain, prefix, tlsStatus (pending|provisioning|active|expired|error), certificateArn, issuedAt, expiresAt';

-- Extend branding table with domain_config if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'branding') THEN
    ALTER TABLE public.branding ADD COLUMN IF NOT EXISTS domain_config JSONB DEFAULT '{}';
  END IF;
END $$;

-- Add domain_config to workspace branding stored in workspaces (if using JSONB branding column)
-- Note: workspace branding may be in workspaces.branding JSONB. Ensure domain_config can be nested.
-- No schema change needed if branding is stored as JSONB - the key can be added at runtime.
