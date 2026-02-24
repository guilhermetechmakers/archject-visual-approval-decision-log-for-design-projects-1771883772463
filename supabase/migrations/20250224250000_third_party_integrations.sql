-- Third-Party Integrations & Webhooks
-- Integrations (OAuth tokens), Calendar reminders, Forge previews, Field mappings, Audit logs

-- Integration provider enum
CREATE TYPE public.integration_provider AS ENUM ('google_calendar', 'autodesk_forge', 'zapier');

-- Integration status enum
CREATE TYPE public.integration_status AS ENUM ('connected', 'disconnected', 'error', 'pending');

-- Integrations: OAuth tokens, per-user or per-project
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider integration_provider NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  status integration_status NOT NULL DEFAULT 'disconnected',
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  expires_at TIMESTAMPTZ,
  scopes TEXT[] DEFAULT '{}',
  config JSONB DEFAULT '{}',
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_integrations_unique_user_provider_project
  ON public.integrations(provider, user_id)
  WHERE project_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_integrations_unique_user_provider_project_id
  ON public.integrations(provider, user_id, project_id)
  WHERE project_id IS NOT NULL;

-- Calendar reminders: decision deadlines -> Google Calendar events
CREATE TABLE IF NOT EXISTS public.calendar_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  google_event_id TEXT,
  trigger_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'created', 'failed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forge previews: signed URLs for BIM/CAD viewer
CREATE TABLE IF NOT EXISTS public.forge_previews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.decision_attachments(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Field mappings: Archject -> external system
CREATE TABLE IF NOT EXISTS public.integration_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  archject_field TEXT NOT NULL,
  external_field TEXT NOT NULL,
  data_type TEXT NOT NULL DEFAULT 'string' CHECK (data_type IN ('string', 'number', 'date', 'boolean', 'json')),
  required BOOLEAN NOT NULL DEFAULT FALSE,
  transformation_script TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Integration audit logs
CREATE TABLE IF NOT EXISTS public.integration_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_id UUID,
  target_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_integrations_user ON public.integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_project ON public.integrations(project_id);
CREATE INDEX IF NOT EXISTS idx_integrations_workspace ON public.integrations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON public.integrations(provider);
CREATE INDEX IF NOT EXISTS idx_calendar_reminders_decision ON public.calendar_reminders(decision_id);
CREATE INDEX IF NOT EXISTS idx_calendar_reminders_integration ON public.calendar_reminders(integration_id);
CREATE INDEX IF NOT EXISTS idx_forge_previews_decision ON public.forge_previews(decision_id);
CREATE INDEX IF NOT EXISTS idx_integration_mappings_integration ON public.integration_mappings(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_audit_actor ON public.integration_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_integration_audit_created ON public.integration_audit_logs(created_at);

-- RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forge_previews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_audit_logs ENABLE ROW LEVEL SECURITY;

-- Integrations: user owns their integrations
CREATE POLICY "Users can view own integrations" ON public.integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations" ON public.integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations" ON public.integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations" ON public.integrations
  FOR DELETE USING (auth.uid() = user_id);

-- Calendar reminders: via decision -> project -> workspace membership
CREATE POLICY "Project members can view calendar reminders" ON public.calendar_reminders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.decisions d
      JOIN public.projects p ON p.id = d.project_id
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE d.id = calendar_reminders.decision_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );

CREATE POLICY "Project members can manage calendar reminders" ON public.calendar_reminders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.decisions d
      JOIN public.projects p ON p.id = d.project_id
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE d.id = calendar_reminders.decision_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );

-- Forge previews: via decision
CREATE POLICY "Project members can view forge previews" ON public.forge_previews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.decisions d
      JOIN public.projects p ON p.id = d.project_id
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE d.id = forge_previews.decision_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );

CREATE POLICY "Project members can manage forge previews" ON public.forge_previews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.decisions d
      JOIN public.projects p ON p.id = d.project_id
      JOIN public.user_workspace_links uwl ON uwl.workspace_id = p.workspace_id
      WHERE d.id = forge_previews.decision_id
        AND uwl.user_id = auth.uid()
        AND uwl.status = 'active'
    )
  );

-- Integration mappings: via integration ownership
CREATE POLICY "Users can view own integration mappings" ON public.integration_mappings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.integrations i WHERE i.id = integration_mappings.integration_id AND i.user_id = auth.uid())
  );

CREATE POLICY "Users can manage own integration mappings" ON public.integration_mappings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.integrations i WHERE i.id = integration_mappings.integration_id AND i.user_id = auth.uid())
  );

-- Integration audit: users can view their own
CREATE POLICY "Users can view own audit logs" ON public.integration_audit_logs
  FOR SELECT USING (auth.uid() = actor_id);
